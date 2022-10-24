/*
 * Copyright 2022 Nordeck IT + Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Capability,
  IModalWidgetCreateData,
  IModalWidgetOpenRequestDataButton,
  IModalWidgetReturnData,
  INotifyCapabilitiesActionRequest,
  IOpenIDCredentials,
  IRoomEvent,
  IWidgetApiRequest,
  IWidgetApiRequestData,
  MatrixCapabilities,
  ModalButtonID,
  Symbols,
  WidgetApi as MatrixWidgetApi,
  WidgetApiToWidgetAction,
  WidgetEventCapability,
} from 'matrix-widget-api';
import {
  concat,
  filter,
  first,
  firstValueFrom,
  from,
  fromEvent,
  map,
  mergeAll,
  Observable,
  share,
  throwError,
} from 'rxjs';
import {
  extractWidgetApiParameters,
  extractWidgetParameters,
  parseWidgetId,
} from './parameters';
import { generateWidgetRegistrationUrl } from './registration';
import {
  RoomEvent,
  StateEvent,
  WidgetApi,
  WidgetConfig,
  WidgetParameters,
} from './types';
import {
  convertToRawCapabilities,
  isDefined,
  isInRoom,
  subtractSet,
  unique,
} from './utils';

/**
 * Options for the {@link WidgetApiImpl.create} function.
 */
export type WidgetApiOptions = {
  /**
   * Optional initial capabilities that should be requested from the user on
   * load.
   */
  capabilities?: Array<WidgetEventCapability | Capability>;
  /**
   * Enable the the pop-out button for pinned widgets that support running
   * without the Widget API.
   */
  supportStandalone?: boolean;
};

/**
 * Implementation of the API from the widget to the client.
 *
 * @remarks Widget API is specified here:
 * https://docs.google.com/document/d/1uPF7XWY_dXTKVKV7jZQ2KmsI19wn9-kFRgQ1tFQP7wQ/edit#heading=h.9rn9lt6ctkgi
 */
export class WidgetApiImpl implements WidgetApi {
  /**
   * Initialize a new widget API instance and wait till it is ready.
   * There should only be one instance of the widget API. The widget API should
   * be created as early as possible when starting the application. This is
   * required to match the timing of the API connection establishment with the
   * client, especially in Safari. Therefore it is recommended to create it
   * inside the entrypoint, before initializing rendering engines like react.
   *
   * @param param0 - {@link WidgetApiOptions}
   *
   * @returns A widget API instance ready to use.
   */
  static async create({
    capabilities = [],
    supportStandalone = false,
  }: WidgetApiOptions = {}): Promise<WidgetApi> {
    const { clientOrigin, widgetId } = extractWidgetApiParameters();
    const widgetParameters = extractWidgetParameters();
    const matrixWidgetApi = new MatrixWidgetApi(widgetId, clientOrigin);
    const widgetApi = new WidgetApiImpl(
      matrixWidgetApi,
      widgetId,
      widgetParameters,
      { capabilities, supportStandalone }
    );

    await widgetApi.initialize();

    return widgetApi;
  }

  private widgetConfig: WidgetConfig<IWidgetApiRequestData> | undefined;
  private outstandingCapabilitiesRequest: Promise<void> | undefined;
  private outstandingOpenIDConnectTokenRequest:
    | Promise<IOpenIDCredentials>
    | undefined;
  private cachedOpenIdToken:
    | { openIdToken: IOpenIDCredentials; expiresAt: number }
    | undefined;
  private readonly events$: Observable<CustomEvent<IWidgetApiRequest>>;
  private readonly initialCapabilities: Array<
    WidgetEventCapability | Capability
  >;

  constructor(
    /**
     * Provide access to the underlying widget API from `matrix-widget-sdk`.
     *
     * @remarks Normally there is no need to use it, however if features are
     *          missing from `WidgetApi` it can be handy to work with the
     *          original API.
     */
    public readonly matrixWidgetApi: MatrixWidgetApi,
    /** {@inheritDoc WidgetApi.widgetId} */
    public readonly widgetId: string,
    /** {@inheritDoc WidgetApi.widgetParameters} */
    public readonly widgetParameters: WidgetParameters,
    { capabilities = [], supportStandalone = false }: WidgetApiOptions = {}
  ) {
    const eventName = `action:${WidgetApiToWidgetAction.SendEvent}`;

    this.events$ = fromEvent(
      this.matrixWidgetApi,
      eventName,
      (event: CustomEvent<IWidgetApiRequest>) => {
        event.preventDefault();
        return event;
      }
    ).pipe(share());
    this.initialCapabilities = [
      ...capabilities,

      // If widget doesn't support running standalone (e.g. in a separate tab),
      // we pass the RequiresClient capabilities to disable the pop-out button.
      ...(supportStandalone ? [] : [MatrixCapabilities.RequiresClient]),
    ];
  }

  /**
   * Initialize the widget API and wait till a connection with the client is
   * fully established.
   *
   * Waits till the user has approved the initial set of capabilities. The
   * method doesn't fail if the user doesn't approve all of them. It is
   * required to check manually afterwards.
   * In case of modal widgets it waits till the `widgetConfig` is received.
   *
   * @remarks Should only be called once during startup.
   */
  public async initialize(): Promise<void> {
    const ready = new Promise<void>((resolve) => {
      this.matrixWidgetApi.once('ready', () => resolve());
    });

    const { isModal } = parseWidgetId(this.widgetId);
    const configReady = isModal
      ? (async () => {
          // TODO: Why is this data only transmitted for modals? Access to data
          // and the rest of the widget config would actually pretty useful:
          // - We can check that the config is correct without having extra
          //   capabilities (e.g. is in already initialied, show an onboarding
          //   dialog instead)
          // A topic to discuss with Ben? Check source closer!
          const widgetConfig$ = fromEvent(
            this.matrixWidgetApi,
            `action:${WidgetApiToWidgetAction.WidgetConfig}`,
            (ev: CustomEvent<IWidgetApiRequest>) => {
              ev.preventDefault();
              this.matrixWidgetApi.transport.reply(ev.detail, {});
              return ev.detail.data as WidgetConfig<IWidgetApiRequestData>;
            }
          );

          this.widgetConfig = await firstValueFrom(widgetConfig$);
        })()
      : undefined;

    const rawCapabilities = unique(
      convertToRawCapabilities(this.initialCapabilities)
    );
    this.matrixWidgetApi.requestCapabilities(rawCapabilities);
    this.matrixWidgetApi.start();

    await ready;

    if (configReady) {
      await configReady;
    }
  }

  /** {@inheritDoc WidgetApi.getWidgetConfig} */
  getWidgetConfig<T extends IWidgetApiRequestData>(): Readonly<
    WidgetConfig<T> | undefined
  > {
    return this.widgetConfig as WidgetConfig<T> | undefined;
  }

  /** {@inheritDoc WidgetApi.rerequestInitialCapabilities} */
  async rerequestInitialCapabilities(): Promise<void> {
    return await this.requestCapabilities(this.initialCapabilities);
  }

  /** {@inheritDoc WidgetApi.hasInitialCapabilities} */
  hasInitialCapabilities(): boolean {
    return this.hasCapabilities(this.initialCapabilities);
  }

  /** {@inheritDoc WidgetApi.requestCapabilities} */
  async requestCapabilities(
    capabilities: Array<WidgetEventCapability | Capability>
  ): Promise<void> {
    if (this.outstandingCapabilitiesRequest) {
      // Avoid starting two capabilities requests in parallel. This can lead to
      // undefined behavior like batching them into one request. This can get
      // the response of this call to become different that what a users might
      // expect.
      // If one already exists, wait for it to finish first:
      try {
        await this.outstandingCapabilitiesRequest;
      } catch {
        // Ignore errors from other executions
      }
    }

    try {
      this.outstandingCapabilitiesRequest =
        this.requestCapabilitiesInternal(capabilities);

      await this.outstandingCapabilitiesRequest;
    } finally {
      this.outstandingCapabilitiesRequest = undefined;
    }
  }

  private async requestCapabilitiesInternal(
    capabilities: Array<WidgetEventCapability | Capability>
  ): Promise<void> {
    const rawCapabilities = unique(convertToRawCapabilities(capabilities));

    // Take shortcut if possible, that avoid extra roundtrips over the API.
    if (this.hasCapabilities(rawCapabilities)) {
      return;
    }

    const requestedSet = new Set(rawCapabilities);
    const capabilities$ = fromEvent(
      this.matrixWidgetApi,
      `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
      (ev: CustomEvent<INotifyCapabilitiesActionRequest>) => ev
    ).pipe(
      // TODO: `hasCapability` in the matrix-widget-api isn't consistent when capability
      //       upgrades happened. But `updateRequestedCapabilities` will deduplicate already
      //       approved capabilities, so the the `requested` field will be inconsistent.
      //       If we would enable this check, the function will never resolve. This should
      //       be reactivated once the capability upgrade is working correctly. See also:
      //       https://github.com/matrix-org/matrix-widget-api/issues/52
      // Ignore events from other parallel capability requests
      //filter((ev) =>
      //  equalsSet(new Set(ev.detail.data.requested), requestedSet)
      //),
      map((ev) => {
        const approvedSet = new Set(ev.detail.data.approved);
        const missingSet = subtractSet(requestedSet, approvedSet);

        if (missingSet.size > 0) {
          throw new Error(
            `Capabilities rejected: ${Array.from(missingSet).join(', ')}`
          );
        }
      }),
      first()
    );

    await new Promise(async (resolve, reject) => {
      const subscription = capabilities$.subscribe({
        next: resolve,
        error: reject,
      });

      try {
        this.matrixWidgetApi.requestCapabilities(rawCapabilities);
        await this.matrixWidgetApi.updateRequestedCapabilities();
      } catch (err) {
        subscription.unsubscribe();
        reject(err);
      }
    });
  }

  /** {@inheritDoc WidgetApi.hasCapabilities} */
  hasCapabilities(
    capabilities: Array<WidgetEventCapability | Capability>
  ): boolean {
    const rawCapabilities = convertToRawCapabilities(capabilities);

    return rawCapabilities.every((c) => this.matrixWidgetApi.hasCapability(c));
  }

  /** {@inheritDoc WidgetApi.receiveSingleStateEvent} */
  async receiveSingleStateEvent<T>(
    eventType: string,
    stateKey = ''
  ): Promise<StateEvent<T> | undefined> {
    const events = await this.receiveStateEvents<T>(eventType, { stateKey });
    return events && events[0];
  }

  /** {@inheritDoc WidgetApi.receiveStateEvents} */
  async receiveStateEvents<T>(
    eventType: string,
    {
      stateKey,
      roomIds,
    }: { stateKey?: string; roomIds?: string[] | Symbols.AnyRoom } = {}
  ): Promise<StateEvent<T>[]> {
    return (await this.matrixWidgetApi.readStateEvents(
      eventType,
      Number.MAX_SAFE_INTEGER,
      stateKey,
      typeof roomIds === 'string' ? [Symbols.AnyRoom] : roomIds
    )) as StateEvent<T>[];
  }

  /** {@inheritDoc WidgetApi.observeStateEvents} */
  observeStateEvents<T>(
    eventType: string,
    {
      stateKey,
      roomIds,
    }: { stateKey?: string; roomIds?: string[] | Symbols.AnyRoom } = {}
  ): Observable<StateEvent<T>> {
    const currentRoomId = this.widgetParameters.roomId;

    if (!currentRoomId) {
      return throwError(() => new Error('Current room id is unknown'));
    }

    const historyEvent$ = from(
      this.receiveStateEvents<T>(eventType, { stateKey, roomIds })
    ).pipe(mergeAll());

    const futureEvent$ = this.events$.pipe(
      map((event) => {
        const matrixEvent = event.detail.data as unknown as IRoomEvent;

        if (
          matrixEvent.type === eventType &&
          matrixEvent.state_key !== undefined &&
          (stateKey === undefined || matrixEvent.state_key === stateKey) &&
          isInRoom(matrixEvent, currentRoomId, roomIds)
        ) {
          this.matrixWidgetApi.transport.reply(event.detail, {});

          return event.detail.data as StateEvent<T>;
        }

        return undefined;
      }),
      filter(isDefined)
    );

    return concat(historyEvent$, futureEvent$);
  }

  /** {@inheritDoc WidgetApi.sendStateEvent} */
  async sendStateEvent<T>(
    eventType: string,
    content: T,
    { roomId, stateKey = '' }: { roomId?: string; stateKey?: string } = {}
  ): Promise<StateEvent<T>> {
    const firstEvent$ = this.events$.pipe(
      map((event) => {
        const matrixEvent = event.detail.data as unknown as IRoomEvent;
        if (
          matrixEvent.sender === this.widgetParameters.userId &&
          matrixEvent.state_key !== undefined &&
          matrixEvent.type === eventType &&
          (!roomId || matrixEvent.room_id === roomId)
        ) {
          this.matrixWidgetApi.transport.reply(event.detail, {});

          return event.detail.data as StateEvent<T>;
        }

        return undefined;
      }),
      filter(isDefined),
      first()
    );

    return new Promise(async (resolve, reject) => {
      const subscription = firstEvent$.subscribe({
        next: (event) => resolve(event),
        error: (err) => reject(err),
      });

      try {
        await this.matrixWidgetApi.sendStateEvent(
          eventType,
          stateKey,
          content,
          roomId
        );
      } catch (err) {
        subscription.unsubscribe();
        reject(err);
      }
    });
  }

  /** {@inheritDoc WidgetApi.receiveRoomEvents} */
  async receiveRoomEvents<T>(
    eventType: string,
    {
      messageType,
      roomIds,
    }: { messageType?: string; roomIds?: string[] | Symbols.AnyRoom } = {}
  ): Promise<Array<RoomEvent<T>>> {
    return (await this.matrixWidgetApi.readRoomEvents(
      eventType,
      Number.MAX_SAFE_INTEGER,
      messageType,
      typeof roomIds === 'string' ? [Symbols.AnyRoom] : roomIds
    )) as RoomEvent<T>[];
  }

  /** {@inheritDoc WidgetApi.observeRoomEvents} */
  observeRoomEvents<T>(
    eventType: string,
    {
      messageType,
      roomIds,
    }: { messageType?: string; roomIds?: string[] | Symbols.AnyRoom } = {}
  ): Observable<RoomEvent<T>> {
    const currentRoomId = this.widgetParameters.roomId;

    if (!currentRoomId) {
      return throwError(() => new Error('Current room id is unknown'));
    }

    const historyEvent$ = from(
      this.receiveRoomEvents<T>(eventType, { messageType, roomIds })
    ).pipe(mergeAll());

    const futureEvent$ = this.events$.pipe(
      map((event) => {
        const matrixEvent = event.detail.data as unknown as IRoomEvent & {
          content: { msgtype?: string };
        };

        if (
          matrixEvent.type === eventType &&
          matrixEvent.state_key === undefined &&
          (!messageType || matrixEvent.content.msgtype === messageType) &&
          isInRoom(matrixEvent, currentRoomId, roomIds)
        ) {
          this.matrixWidgetApi.transport.reply(event.detail, {});

          return event.detail.data as RoomEvent<T>;
        }

        return undefined;
      }),
      filter(isDefined)
    );

    return concat(historyEvent$, futureEvent$);
  }

  /** {@inheritDoc WidgetApi.sendRoomEvent} */
  async sendRoomEvent<T>(
    eventType: string,
    content: T,
    { roomId }: { roomId?: string } = {}
  ): Promise<RoomEvent<T>> {
    const firstEvents$ = this.events$.pipe(
      map((event) => {
        const matrixEvent = event.detail.data as unknown as IRoomEvent;
        if (
          matrixEvent.sender === this.widgetParameters.userId &&
          matrixEvent.state_key === undefined &&
          matrixEvent.type === eventType &&
          (!roomId || matrixEvent.room_id === roomId)
        ) {
          this.matrixWidgetApi.transport.reply(event.detail, {});

          return event.detail.data as RoomEvent<T>;
        }

        return undefined;
      }),
      filter(isDefined),
      first()
    );

    return new Promise(async (resolve, reject) => {
      const subscription = firstEvents$.subscribe({
        next: (event) => resolve(event),
        error: (err) => reject(err),
      });

      try {
        await this.matrixWidgetApi.sendRoomEvent(eventType, content, roomId);
      } catch (err) {
        subscription.unsubscribe();
        reject(err);
      }
    });
  }

  /** {@inheritDoc WidgetApi.readEventRelations} */
  async readEventRelations(
    eventId: string,
    options?: {
      roomId?: string;
      limit?: number;
      from?: string;
      relationType?: string;
      eventType?: string;
    }
  ): Promise<{
    originalEvent?: RoomEvent | StateEvent;
    chunk: Array<RoomEvent | StateEvent>;
    nextToken?: string;
  }> {
    const { original_event, chunk, next_batch } =
      await this.matrixWidgetApi.readEventRelations(
        eventId,
        options?.roomId,
        options?.relationType,
        options?.eventType,
        options?.limit,
        options?.from
      );

    return {
      originalEvent: original_event,
      chunk,
      nextToken: next_batch,
    };
  }

  /** {@inheritDoc WidgetApi.openModal} */
  async openModal<
    T extends Record<string, unknown> = Record<string, unknown>,
    U extends IModalWidgetCreateData = IModalWidgetCreateData
  >(
    pathName: string,
    name: string,
    options?: {
      buttons?: IModalWidgetOpenRequestDataButton[];
      data?: U;
    }
  ): Promise<T | undefined> {
    const { isModal } = parseWidgetId(this.widgetId);
    if (isModal) {
      throw new Error("Modals can't be opened from another modal widget");
    }

    const url = generateWidgetRegistrationUrl({
      pathName,
      widgetParameters: this.widgetParameters,
    });
    await this.matrixWidgetApi.openModalWidget(
      url,
      name,
      options?.buttons,
      options?.data
    );

    const closeModalWidget$ = fromEvent(
      this.matrixWidgetApi,
      `action:${WidgetApiToWidgetAction.CloseModalWidget}`,
      (event: CustomEvent<IWidgetApiRequest>) => {
        event.preventDefault();
        this.matrixWidgetApi.transport.reply(event.detail, {});

        if (event.detail.data?.['m.exited'] === true) {
          return undefined;
        }

        return event.detail.data as unknown as T;
      }
    );

    return firstValueFrom(closeModalWidget$);
  }

  /** {@inheritDoc WidgetApi.setModalButtonEnabled} */
  async setModalButtonEnabled(
    buttonId: ModalButtonID,
    isEnabled: boolean
  ): Promise<void> {
    const { isModal } = parseWidgetId(this.widgetId);
    if (!isModal) {
      throw new Error('Modal buttons can only be enabled from a modal widget');
    }

    await this.matrixWidgetApi.setModalButtonEnabled(buttonId, isEnabled);
  }

  /** {@inheritDoc WidgetApi.observeModalButtons} */
  observeModalButtons(): Observable<ModalButtonID> {
    const { isModal } = parseWidgetId(this.widgetId);
    if (!isModal) {
      throw new Error('Modal buttons can only be observed from a modal widget');
    }

    return fromEvent(
      this.matrixWidgetApi,
      `action:${WidgetApiToWidgetAction.ButtonClicked}`,
      (event: CustomEvent<IWidgetApiRequest>) => {
        event.preventDefault();
        this.matrixWidgetApi.transport.reply(event.detail, {});

        return event.detail.data.id as ModalButtonID;
      }
    );
  }

  /** {@inheritDoc WidgetApi.closeModal} */
  async closeModal<T extends IModalWidgetReturnData>(data?: T): Promise<void> {
    const { isModal } = parseWidgetId(this.widgetId);
    if (!isModal) {
      throw new Error('Modals can only be closed from a modal widget');
    }

    await this.matrixWidgetApi.closeModalWidget(
      data ? data : { 'm.exited': true }
    );
  }

  /** {@inheritdoc WidgetApi.navigateTo} */
  async navigateTo(uri: string): Promise<void> {
    await this.matrixWidgetApi.navigateTo(uri);
  }

  /** {@inheritdoc WidgetApi.requestOpenIDConnectToken} */
  async requestOpenIDConnectToken(): Promise<IOpenIDCredentials> {
    if (this.outstandingOpenIDConnectTokenRequest) {
      // Avoid starting two OIDC token requests in parallel. This can lead to
      // two dialogs being open in parallel and annoys the user and can get
      // the response of this call to become different that what a users might
      // expect (not saving the "remember choice" option).
      // If one already exists, wait for it to finish first, but ignore the
      // result. In the best case we can just use the cached result in the next
      // call.
      try {
        await this.outstandingOpenIDConnectTokenRequest;
      } catch {
        // Ignore errors from other executions
      }
    }

    try {
      this.outstandingOpenIDConnectTokenRequest =
        this.requestOpenIDConnectTokenInternal();

      return await this.outstandingOpenIDConnectTokenRequest;
    } finally {
      this.outstandingOpenIDConnectTokenRequest = undefined;
    }
  }

  private async requestOpenIDConnectTokenInternal(): Promise<IOpenIDCredentials> {
    const leywayMilliseconds = 30 * 1000;

    if (
      this.cachedOpenIdToken &&
      this.cachedOpenIdToken.expiresAt - leywayMilliseconds > Date.now()
    ) {
      return this.cachedOpenIdToken.openIdToken;
    }

    try {
      const openIdToken =
        await this.matrixWidgetApi.requestOpenIDConnectToken();

      this.cachedOpenIdToken = {
        openIdToken,
        expiresAt: Date.now() + (openIdToken.expires_in ?? 0) * 1000,
      };

      return openIdToken;
    } catch (err) {
      this.cachedOpenIdToken = undefined;
      throw err;
    }
  }
}

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
  IOpenIDCredentials,
  IRoomEvent,
  IWidget,
  IWidgetApiRequest,
  IWidgetApiRequestData,
  ModalButtonID,
  Symbols,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { Observable } from 'rxjs';

/**
 * Parameters passed from the client to the widget during initialization.
 */
export type WidgetParameters = {
  /**
   * The user id of the current user.
   */
  userId?: string;
  /**
   * The display name of the current user.
   *
   * Might be the user id, if the user has no display name configured.
   */
  displayName?: string;
  /**
   * The URL of the avatar of the current user.
   *
   * Might be unset, if the user has no avatar configured.
   */
  avatarUrl?: string;
  /**
   * The room id of the room the widget is registered in.
   */
  roomId?: string;
  /**
   * The current selected theme in the client.
   *
   * Right now, it's either "light" or "dark".
   */
  theme?: string;
  /**
   * The id of the client that this widget is running in, for example
   * "io.element.web".
   */
  clientId?: string;
  /**
   * The current selected language in the client.
   */
  clientLanguage?: string;
  /**
   * Whether the widget was opened by a client or not.
   *
   * This is independent from whether the widget API is available or not.
   * For example, in mobile clients this can be true, but we don't have
   * access to widgets API there.
   */
  isOpenedByClient: boolean;
};

/**
 * Generic type for state events.
 */
export type StateEvent<T = unknown> = Omit<
  IRoomEvent,
  'content' | 'unsigned' | 'state_key'
> & {
  state_key: string;
  content: T;
};

/**
 * Generic type for room events.
 */
export type RoomEvent<T = unknown> = Omit<
  IRoomEvent,
  'content' | 'state_key' | 'unsigned'
> & {
  content: T;
};

/**
 * Generic type for to device message events.
 */
export type ToDeviceMessageEvent<T = unknown> = {
  type: string;
  sender: string;
  encrypted: boolean;
  content: T;
};

/**
 * Configuration of a widget, including data passed to it.
 */
export type WidgetConfig<T extends IWidgetApiRequestData> = Omit<
  IWidgetApiRequest & IWidget,
  'data'
> & { data: T };

/**
 * WebRTC Ice server credentials like turn servers, type is compatible to
 * `RTCIceServer` from WebRTC.
 */
export type TurnServer = {
  /** One or more URLs for this turn server. */
  urls: string[];
  /** Username for this turn server. */
  username: string;
  /** Credentials for this turn server. */
  credential: string;
};

/**
 * Configuration of the widget in the room.
 */
export type WidgetRegistration = {
  /**
   * Configure an optional type.
   *
   * Make sure to include a custom prefix when using built-in names.
   * You can discover the available icons in the [Element source code](https://github.com/matrix-org/matrix-react-sdk/blob/9d6d8fc666855ca0c06c71ccb30c74ac4fc8fd12/src/components/views/avatars/WidgetAvatar.tsx#L29-L39).
   */
  type?: string;
  /**
   * The display name of the widget.
   */
  name?: string;
  /**
   * The avatar URL used to display an icon on the widget.
   *
   * @remarks Not supported at the moment, as uploading avatars to the channel
   *          is not possible from a widget right now.
   */
  avatarUrl?: string;
  /**
   * Optional additional data that can be used to initialize the widget.
   */
  data?:
    | Record<string, unknown>
    | {
        /**
         * An optional sub title for the widget.
         */
        title?: string;
      };
};

/**
 * API for communication from the widget to the client.
 */
export type WidgetApi = {
  /**
   * The widget Id of the current widget used for the registration in the room.
   */
  readonly widgetId: string;
  /**
   * Parameters to the widget that are transmitted via the widget URL.
   */
  readonly widgetParameters: Readonly<WidgetParameters>;

  /**
   * Get the configuration of the widget, if available.
   *
   * @remarks At the moment, this is only available for modal widgets,
   *          otherwise it's `undefined`.
   */
  getWidgetConfig<T extends IWidgetApiRequestData>(): Readonly<
    WidgetConfig<T> | undefined
  >;

  /**
   * Rerequests capabilities initially passed in the constructor.
   *
   * This is useful in case the user denied one or all of them.
   */
  rerequestInitialCapabilities(): Promise<void>;

  /**
   * True, if the initial capabilities passed via the constructor were granted.
   */
  hasInitialCapabilities(): boolean;

  /**
   * Request a list of capabilities.
   *
   * Can be called at any time, not just initially.
   * Resolves once the user has answered the capabilities request.
   *
   * @param capabilities - A list of capabilities that should be requested
   * @throws error if the capabilities request or one of the capabilities was
   *         rejected by the user
   */
  requestCapabilities(
    capabilities: Array<WidgetEventCapability | Capability>,
  ): Promise<void>;

  /**
   * Checks whether the widget has already access to the provided capabilities,
   * without requesting them.
   *
   * @param capabilities - A list of capabilities that should be checked.
   */
  hasCapabilities(
    capabilities: Array<WidgetEventCapability | Capability>,
  ): boolean;

  /**
   * Receive the last state event of a give type and state key from the current
   * room if any exists.
   *
   * @remarks While one can type the returned event using the generic parameter
   *          `T`, it is not recommended to rely on this type till further
   *          validation of the event structure is performed.
   *
   * @param eventType - The type of the event to receive.
   * @param stateKey - Specifies the state key to retrieve, uses `''` (empty
   *                   string) if no state key is passed.
   */
  receiveSingleStateEvent<T>(
    eventType: string,
    stateKey?: string,
  ): Promise<StateEvent<T> | undefined>;

  /**
   * Receives the state events of a give type from the current room if any
   * exists.
   *
   * @remarks While one can type the returned event using the generic parameter
   *          `T`, it is not recommended to rely on this type till further
   *          validation of the event structure is performed.
   *
   * @param eventType - The type of the event to receive.
   * @param options - Options for receiving the state event.
   *                  Use `stateKey` to receive events with a specifc state
   *                  key.
   *                  Use `roomIds` to receive the state events from other
   *                  rooms.
   *                  Pass `Symbols.AnyRoom` to receive from all rooms of the
   *                  user.
   */
  receiveStateEvents<T>(
    eventType: string,
    options?: { stateKey?: string; roomIds?: string[] | Symbols.AnyRoom },
  ): Promise<StateEvent<T>[]>;

  /**
   * Provide an observable that can be used to listen to state event updates of
   * a given type in the current room.
   * Initially, the current state event is emitted, if one exists.
   *
   * @remarks While one can type the returned event using the generic parameter
   *          `T`, it is not recommended to rely on this type till further
   *          validation of the event structure is performed.
   *
   * @param eventType - The type of the event to receive.
   * @param options - Options for receiving the state event.
   *                  Use `stateKey` to receive events with a specifc state
   *                  key.
   *                  Use `roomIds` to receive the state events from other
   *                  rooms.
   *                  Pass `Symbols.AnyRoom` to receive from all rooms of the
   *                  user.
   */
  observeStateEvents<T>(
    eventType: string,
    options?: { stateKey?: string; roomIds?: string[] | Symbols.AnyRoom },
  ): Observable<StateEvent<T>>;

  /**
   * Send a state event with a given type to the current room and wait till the
   * operation is completed.
   * @param eventType - The type of the event to send.
   * @param content - The content of the event.
   * @param options - Options for sending the state event.
   *                  Use `roomId` to send the state event to another room.
   *                  Use `stateKey` to send a state event with a custom state
   *                  key.
   */
  sendStateEvent<T>(
    eventType: string,
    content: T,
    options?: { roomId?: string; stateKey?: string },
  ): Promise<StateEvent<T>>;

  /**
   * Receive all room events of a given type from the current room.
   *
   * @remarks While one can type the returned event using the generic parameter
   *          `T`, it is not recommended to rely on this type till further
   *          validation of the event structure is performed.
   *
   * @param eventType - The type of the event to receive.
   * @param options - Options for receiving the room event.
   *                  Use `messageType` to receive events with a specific
   *                  message type.
   *                  Use `roomIds` to receive the state events from other
   *                  rooms.
   *                  Pass `Symbols.AnyRoom` to receive from all rooms of the
   *                  user.
   */
  receiveRoomEvents<T>(
    eventType: string,
    options?: { messageType?: string; roomIds?: string[] | Symbols.AnyRoom },
  ): Promise<Array<RoomEvent<T>>>;

  /**
   * Provide an observable that can be used to listen to room event updates of
   * a given type in the current room.
   * Initially, the previous room events are emitted.
   *
   * @remarks While one can type the returned event using the generic parameter
   *          `T`, it is not recommended to rely on this type till further
   *          validation of the event structure is performed.
   *
   * @param eventType - The type of the event to receive.
   * @param options - Options for receiving the room event.
   *                  Use `messageType` to receive events with a specific
   *                  message type.
   *                  Use `roomIds` to receive the state events from other
   *                  rooms.
   *                  Pass `Symbols.AnyRoom` to receive from all rooms of the
   *                  user.
   */
  observeRoomEvents<T>(
    eventType: string,
    options?: { messageType?: string; roomIds?: string[] | Symbols.AnyRoom },
  ): Observable<RoomEvent<T>>;

  /**
   * Send a room event with a given type to the current room and wait till the
   * operation is completed.
   * @param eventType - The type of the event to send.
   * @param content - The content of the event.
   * @param options - Options for sending the room event.
   *                  Use `roomId` to send the room event to another room.
   */
  sendRoomEvent<T>(
    eventType: string,
    content: T,
    options?: { roomId?: string },
  ): Promise<RoomEvent<T>>;

  /**
   * Receive all events that relate to a given `eventId` by means of MSC2674.
   * `chunk` can include state events or room events.
   *
   * @remarks You can only receive events where the capability to receive it was
   *          approved. If an event in `chunk` is not approved, it is silently
   *          skipped. Note that the call might return less than `limit` events
   *          due to various reasons, including missing capabilities or encrypted
   *          events.
   *
   * @param eventId - The id of the event to receive
   * @param options - Options for receiving the related events.
   *                  Use `roomId` to receive the event from another room.
   *                  Use `limit` to control the page size.
   *                  Use `from` to request the next page of events by providing
   *                  `nextToken` of a previous call. If `nextToken === undefined`,
   *                  no further page exists.
   *                  Use `relationType` to only return events with that `rel_type`.
   *                  Use `eventType` to only return events with that `type`.
   *                  Use `direction` to change time-order of the chunks
   *                  (default: 'b').
   *
   * @throws if the capability to receive the type of event is missing.
   */
  readEventRelations(
    eventId: string,
    options?: {
      roomId?: string;
      limit?: number;
      from?: string;
      relationType?: string;
      eventType?: string;
      direction?: 'f' | 'b';
    },
  ): Promise<{
    chunk: Array<RoomEvent | StateEvent>;
    nextToken?: string;
  }>;

  /**
   * Send a message to a device of a user (or multiple users / devices).
   *
   * @param eventType - The type of the event.
   * @param encrypted - Whether the event should be encrypted.
   * @param content - The content to send. This is a map of user ids, to device
   *                  ids, to the content that should be send. It is possible to
   *                  specify a `'*'` device, to send the content to all devices
   *                  of a user.
   */
  sendToDeviceMessage<T>(
    eventType: string,
    encrypted: boolean,
    content: { [userId: string]: { [deviceId: string | '*']: T } },
  ): Promise<void>;

  /**
   * Observes all to device messages send to the current device.
   *
   * @param eventType - The type of the event.
   */
  observeToDeviceMessages<T>(
    eventType: string,
  ): Observable<ToDeviceMessageEvent<T>>;

  /**
   * Open a new modal, wait until the modal closes, and return the result.
   *
   * This function can only be called from a Widget.
   *
   * @param pathName - The path to include a sub path in the URL.
   * @param name - The name of the modal.
   * @param options - Options for opening the Modal.
   *                  Use `buttons` to show buttons in the widget.
   *                  Use `data` to supply optional data to the modal widget.
   * @returns The result data of the modal widget.
   *
   * @throws if called from a modal widget
   */
  openModal<
    T extends Record<string, unknown> = Record<string, unknown>,
    U extends IModalWidgetCreateData = IModalWidgetCreateData,
  >(
    pathName: string,
    name: string,
    options?: {
      buttons?: IModalWidgetOpenRequestDataButton[];
      data?: U;
    },
  ): Promise<T | undefined>;

  /**
   * Enable or disable a button on a modal widget.
   *
   * This function can only be called from a Modal.
   *
   * @param buttonId - The id of the button to enable/disable.
   * @param isEnabled - If `true`, the button is enabled.
   *                    If `false`, the button is disabled.
   *
   * @throws if called from a non-modal widget
   */
  setModalButtonEnabled(
    buttonId: ModalButtonID,
    isEnabled: boolean,
  ): Promise<void>;

  /**
   * Provide an observable that emits button clicks.
   * The emitted values are the button ids.
   *
   * This function can only be called from a Modal.
   *
   * @throws if called from a non-modal widget
   */
  observeModalButtons(): Observable<ModalButtonID>;

  /**
   * Close the modal widget.
   *
   * This function can only be called from a Modal.
   *
   * @param data - Optional data to pass to the widget that opened the modal.
   *               Defaults to `{ 'm.exited': true }`.
   *
   * @throws if called from a non-modal widget
   */
  closeModal<T extends IModalWidgetReturnData>(data?: T): Promise<void>;

  /**
   * Navigate the client to the given Matrix URI.
   *
   * This supports:
   * - matrix.to urls ({@link https://spec.matrix.org/v1.2/appendices/#matrixto-navigation})
   *
   * @remarks In future, the Matrix URI scheme will also be defined. This
   *          requires the `org.matrix.msc2931.navigate` capability.
   *
   * @param uri - the URI to navigate to.
   * @throws Throws if the URI is invalid or cannot be processed.
   */
  navigateTo(uri: string): Promise<void>;

  /**
   * Requests an OIDC token that can be used to verify the identity of the
   * current user at the `/_matrix/federation/v1/openid/userinfo` endpoint of
   * the home server ({@link https://spec.matrix.org/v1.2/server-server-api/#openid}).
   * The home server can be accessed from the `matrix_server_name` property.
   *
   * @remarks The methods caches the token and only requests a new once if the
   *          old one expired.
   */
  requestOpenIDConnectToken(): Promise<IOpenIDCredentials>;

  /**
   * Returns an observable containing WebRTC Ice server credentials, like turn
   * servers, if available.
   */
  observeTurnServers(): Observable<TurnServer>;

  /**
   * Search for users in the user directory.
   *
   * @param searchTerm - The term to search for.
   * @param options - Options for searching.
   *                  Use `limit` to limit the number of results to return.
   * @returns The search results.
   */
  searchUserDirectory(
    searchTerm: string,
    options?: { limit?: number },
  ): Promise<{
    results: Array<{
      userId: string;
      displayName?: string;
      avatarUrl?: string;
    }>;
  }>;

  // TODO: sendSticker, setAlwaysOnScreen
};

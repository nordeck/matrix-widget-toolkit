/*
 * Copyright 2025 Nordeck IT + Consulting GmbH
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

import { WidgetApi } from '@matrix-widget-toolkit/api';
import { IRequestOpts } from 'matrix-js-sdk/src/http-api';
import {
  EmptyObject,
  IContent,
  ISendEventResponse,
  MatrixEvent,
  Room,
  SendDelayedEventRequestOpts,
  SendDelayedEventResponse,
  UpdateDelayedEventAction,
} from 'matrix-js-sdk/src/matrix';
import { RTCClient } from 'matrix-js-sdk/src/matrixrtc';
import { StateEvents, TimelineEvents } from 'matrix-js-sdk/src/types';

export class MatrixRTCClient implements RTCClient {
  private room?: Room;

  public constructor(private readonly widgetApi: WidgetApi) {
    this.widgetApi = widgetApi;
    this.room = this.getRoom(widgetApi.widgetParameters.roomId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public cancelPendingEvent(event: MatrixEvent): void {
    throw new Error('Method not implemented.');
  }

  public getDeviceId(): string | null {
    return this.widgetApi.widgetParameters.deviceId ?? null;
  }

  public sendEvent<K extends keyof TimelineEvents>(
    roomId: string,
    eventType: K,
    content: TimelineEvents[K],
    txnId?: string,
  ): Promise<ISendEventResponse>;
  public sendEvent<K extends keyof TimelineEvents>(
    roomId: string,
    threadId: string | null,
    eventType: K,
    content: TimelineEvents[K],
    txnId?: string,
  ): Promise<ISendEventResponse>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public sendEvent(
    roomId: string,
    threadIdOrEventType: string | null,
    eventTypeOrContent: string | IContent,
    contentOrTxnId?: IContent | string,
    txnIdOrVoid?: string,
  ): Promise<ISendEventResponse> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public sendStateEvent<K extends keyof StateEvents>(
    roomId: string,
    eventType: K,
    content: StateEvents[K],
    stateKey?: string,
    opts?: IRequestOpts,
  ): Promise<ISendEventResponse> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public _unstable_sendDelayedEvent<K extends keyof TimelineEvents>(
    roomId: string,
    delayOpts: SendDelayedEventRequestOpts,
    threadId: string | null,
    eventType: K,
    content: TimelineEvents[K],
    txnId?: string,
  ): Promise<SendDelayedEventResponse> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public _unstable_sendDelayedStateEvent<K extends keyof StateEvents>(
    roomId: string,
    delayOpts: SendDelayedEventRequestOpts,
    eventType: K,
    content: StateEvents[K],
    stateKey?: string,
    opts?: IRequestOpts,
  ): Promise<SendDelayedEventResponse> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public _unstable_updateDelayedEvent(
    delayId: string,
    action: UpdateDelayedEventAction,
  ): Promise<EmptyObject> {
    throw new Error('Method not implemented.');
  }

  public getUserId(): string | null {
    return this.widgetApi.widgetParameters.userId ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getRoom(roomId: string | undefined): Room {
    throw new Error('Method not implemented');
  }
}

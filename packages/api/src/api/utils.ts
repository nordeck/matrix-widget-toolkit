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
  IRoomEvent,
  ISendEventFromWidgetResponseData,
  Symbols,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { StateEvent, WidgetApi } from './types';

export function convertToRawCapabilities(
  rawCapabilities: Array<WidgetEventCapability | Capability>,
): string[] {
  return rawCapabilities.map((c) => (typeof c === 'string' ? c : c.raw));
}

/**
 * Create a state event from the arguments.
 *
 * @returns A state event with current timestamp origin_server_ts.
 */
export function makeEventFromSendStateEventResult<T>(
  type: string,
  stateKey: string,
  content: T,
  sender: string,
  sendResult: ISendEventFromWidgetResponseData,
): StateEvent<T> {
  if (sendResult.event_id === undefined) {
    throw new Error('Send state event did not return an event ID');
  }

  return {
    content,
    event_id: sendResult.event_id,
    origin_server_ts: Date.now(),
    room_id: sendResult.room_id,
    sender,
    state_key: stateKey,
    type,
  };
}

/**
 * Send a state event and resolve to a "virtual" state event.
 *
 * @returns Promise, that resolves to a state event with current timestamp origin_server_ts.
 */
export async function sendStateEventWithEventResult<T>(
  widgetApi: WidgetApi,
  type: string,
  stateKey: string,
  content: T,
): Promise<StateEvent<T>> {
  if (widgetApi.widgetParameters.userId === undefined) {
    throw new Error('Own user ID is undefined');
  }

  const response = await widgetApi.sendStateEvent(type, content, { stateKey });

  return makeEventFromSendStateEventResult(
    type,
    stateKey,
    content,
    widgetApi.widgetParameters.userId,
    response,
  );
}

export function isInRoom(
  matrixEvent: IRoomEvent,
  currentRoomId: string,
  roomIds?: string[] | Symbols.AnyRoom,
): boolean {
  if (!roomIds) {
    return matrixEvent.room_id === currentRoomId;
  }

  if (typeof roomIds === 'string') {
    if (roomIds !== Symbols.AnyRoom) {
      throw Error(`Unknown room id symbol: ${roomIds}`);
    }

    return true;
  }

  return roomIds.includes(matrixEvent.room_id);
}

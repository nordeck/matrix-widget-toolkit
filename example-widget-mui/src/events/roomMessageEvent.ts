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

import { RoomEvent } from '@matrix-widget-toolkit/api';
import Joi from 'joi';
import { isValidEvent } from './validation';

/**
 * The event type of the room message.
 */
export const ROOM_EVENT_ROOM_MESSAGE = 'm.room.message';

export type RoomMessageEvent = {
  msgtype: string;
  body: string;
};

const roomMessageEventSchema = Joi.object<RoomMessageEvent, true>({
  msgtype: Joi.string().required(),
  body: Joi.string().required(),
}).unknown();

/**
 * Validates that `event` has a valid structure for a
 * {@link RoomMessageEvent}.
 *
 * @param event - The event to validate.
 * @returns true, if the event is valid.
 */
export function isValidRoomMessageEvent(
  event: RoomEvent<unknown>
): event is RoomEvent<RoomMessageEvent> {
  return isValidEvent(event, ROOM_EVENT_ROOM_MESSAGE, roomMessageEventSchema);
}

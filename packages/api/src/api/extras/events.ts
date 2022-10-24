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

import { RoomEvent, StateEvent } from '../types';

/**
 * Check if the given event is a {@link StateEvent}.
 *
 * @param event - An event that is either a {@link RoomEvent} or a {@link StateEvent}.
 * @returns True, if the event is a {@link StateEvent}.
 */
export function isStateEvent(
  event: RoomEvent | StateEvent
): event is StateEvent {
  return 'state_key' in event && typeof event.state_key === 'string';
}

/**
 * Check if the given event is a {@link RoomEvent}.
 *
 * @param event - An event that is either a {@link RoomEvent} or a {@link StateEvent}.
 * @returns True, if the event is a {@link RoomEvent}.
 */
export function isRoomEvent(event: RoomEvent | StateEvent): event is RoomEvent {
  return !('state_key' in event);
}

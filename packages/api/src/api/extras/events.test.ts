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
import { isRoomEvent, isStateEvent } from './events';

const roomEvent: RoomEvent = {
  type: 'com.example.type',
  sender: '@user-id',
  event_id: '$id',
  content: {},
  origin_server_ts: 0,
  room_id: '!room-id',
};

const stateEvent: StateEvent = {
  ...roomEvent,
  state_key: '',
};

describe('isStateEvent', () => {
  it('should accept StateEvent', () => {
    expect(isStateEvent(stateEvent)).toBe(true);
  });

  it('should reject RoomEvent', () => {
    expect(isStateEvent(roomEvent)).toBe(false);
  });
});

describe('isRoomEvent', () => {
  it('should accept RoomEvent', () => {
    expect(isRoomEvent(roomEvent)).toBe(true);
  });

  it('should reject StateEvent', () => {
    expect(isRoomEvent(stateEvent)).toBe(false);
  });
});

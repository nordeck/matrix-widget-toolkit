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

import { describe, expect, it } from 'vitest';
import { RoomEvent, StateEvent, ToDeviceMessageEvent } from '../types';
import {
  isRoomEvent,
  isStateEvent,
  isValidRoomEvent,
  isValidStateEvent,
  isValidToDeviceMessageEvent,
} from './events';

const roomEvent: RoomEvent = {
  type: 'com.example.type',
  sender: '@user-id',
  event_id: '$id',
  content: {},
  origin_server_ts: 1739189593951,
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

const roomEventData: RoomEvent = {
  type: 'm.room.message',
  sender: '@user:example.com',
  event_id: '$event-1',
  room_id: '!room:example.com',
  origin_server_ts: 1739189593951,
  content: {
    body: 'This is a test',
  },
};

describe('isValidRoomEvent', () => {
  it('should accept room event', () => {
    expect(isValidRoomEvent(roomEventData)).toBe(true);
  });

  it.each<object>([
    { type: undefined },
    { sender: undefined },
    { event_id: undefined },
    { origin_server_ts: undefined },
    { content: undefined },
    { type: 23 },
    { sender: 23 },
    { event_id: 23 },
    { origin_server_ts: 'string' },
    { content: 23 },
  ])('should reject room event with patch %p', (patch: object) => {
    expect(
      isValidRoomEvent({
        ...roomEventData,
        ...patch,
      }),
    ).toBe(false);
  });
});

const stateEventData: StateEvent = {
  ...roomEventData,
  state_key: '',
};

describe('isValidStateEvent', () => {
  it.each([
    [{ ...stateEventData }],
    [{ ...stateEventData, state_key: '@user:example.com' }],
  ])('should accept state event', (event) => {
    expect(isValidStateEvent(event)).toBe(true);
  });

  it.each<object>([
    { type: undefined },
    { sender: undefined },
    { event_id: undefined },
    { room_id: undefined },
    { origin_server_ts: undefined },
    { content: undefined },
    { type: 23 },
    { sender: 23 },
    { event_id: 23 },
    { room_id: 23 },
    { origin_server_ts: 'string' },
    { content: 23 },
    { state_key: 23 },
  ])('should reject state event with patch %p', (patch: object) => {
    expect(
      isValidStateEvent({
        ...stateEventData,
        ...patch,
      }),
    ).toBe(false);
  });
});

const toDeviceMessageData: ToDeviceMessageEvent = {
  type: 'm.new_device',
  sender: '@user:example.com',
  encrypted: false,
  content: { device_id: 'ABC123' },
};

describe('isValidToDeviceMessageEvent', () => {
  it.each([
    [{ ...toDeviceMessageData }],
    [{ ...toDeviceMessageData, encrypted: true }],
  ])('should accept to device message', (event) => {
    expect(isValidToDeviceMessageEvent(event)).toBe(true);
  });

  it.each<object>([
    { type: undefined },
    { sender: undefined },
    { encrypted: undefined },
    { content: undefined },
    { type: 23 },
    { sender: 23 },
    { encrypted: 23 },
    { content: 23 },
  ])('should reject to device message with patch %p', (patch: object) => {
    expect(
      isValidToDeviceMessageEvent({
        ...toDeviceMessageData,
        ...patch,
      }),
    ).toBe(false);
  });
});

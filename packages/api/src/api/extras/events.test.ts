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
import { RoomEvent, StateEvent } from '../types';
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

const roomEventData = {
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
  it('should return true for a valid event', () => {
    expect(
      isValidRoomEvent({
        ...roomEventData,
      }),
    ).toBe(true);
  });

  it.each([
    [{}],
    [
      {
        ...roomEventData,
        type: undefined,
      },
    ],
    [
      {
        ...roomEventData,
        sender: undefined,
      },
    ],
    [
      {
        ...roomEventData,
        event_id: undefined,
      },
    ],
    [
      {
        ...roomEventData,
        origin_server_ts: undefined,
      },
    ],
    [
      {
        ...roomEventData,
        content: undefined,
      },
    ],
    [
      {
        ...roomEventData,
        type: 23,
      },
    ],
    [
      {
        ...roomEventData,
        sender: 23,
      },
    ],
    [
      {
        ...roomEventData,
        event_id: 23,
      },
    ],
    [
      {
        ...roomEventData,
        origin_server_ts: 'string',
      },
    ],
    [
      {
        ...roomEventData,
        content: 23,
      },
    ],
  ])('should return false for an invalid event (%#)', (event) => {
    expect(isValidRoomEvent(event)).toBe(false);
  });
});

const stateEventData = {
  ...roomEventData,
  state_key: '',
};

describe('isValidStateEVent', () => {
  it.each([
    [{ ...stateEventData }],
    [{ ...stateEventData, state_key: '@user:example.com' }],
  ])('should return true for a valid state event', (event) => {
    expect(
      isValidStateEvent({
        ...event,
      }),
    ).toBe(true);
  });

  it.each([
    [{}],
    [
      {
        ...stateEventData,
        type: undefined,
      },
    ],
    [
      {
        ...stateEventData,
        sender: undefined,
      },
    ],
    [
      {
        ...stateEventData,
        event_id: undefined,
      },
    ],
    [
      {
        ...stateEventData,
        room_id: undefined,
      },
    ],
    [
      {
        ...stateEventData,
        origin_server_ts: undefined,
      },
    ],
    [
      {
        ...stateEventData,
        content: undefined,
      },
    ],
    [
      {
        ...stateEventData,
        type: 23,
      },
    ],
    [
      {
        ...stateEventData,
        sender: 23,
      },
    ],
    [
      {
        ...stateEventData,
        event_id: 23,
      },
    ],
    [
      {
        ...stateEventData,
        room_id: 23,
      },
    ],
    [
      {
        ...stateEventData,
        origin_server_ts: 'string',
      },
    ],
    [
      {
        ...stateEventData,
        content: 23,
      },
    ],
    [
      {
        ...stateEventData,
        state_key: 23,
      },
    ],
  ])('should return false for an invalid state event (%#)', (event) => {
    expect(isValidStateEvent(event)).toBe(false);
  });
});

const toDeviceMessageData = {
  type: 'm.new_device',
  sender: '@user:example.com',
  encrypted: false,
  content: { device_id: 'ABC123' },
};

describe('isValidToDeviceMessageEvent', () => {
  it.each([
    [{ ...toDeviceMessageData }],
    [{ ...toDeviceMessageData, encrypted: true }],
  ])('should return true for a valid to device message', (event) => {
    expect(isValidToDeviceMessageEvent(event)).toBe(true);
  });

  it.each([
    [{}],
    [
      {
        ...toDeviceMessageData,
        type: undefined,
      },
    ],
    [
      {
        ...toDeviceMessageData,
        sender: undefined,
      },
    ],
    [
      {
        ...toDeviceMessageData,
        encrypted: undefined,
      },
    ],
    [
      {
        ...toDeviceMessageData,
        content: undefined,
      },
    ],
    [
      {
        ...toDeviceMessageData,
        type: 23,
      },
    ],
    [
      {
        ...toDeviceMessageData,
        sender: 23,
      },
    ],
    [
      {
        ...toDeviceMessageData,
        encrypted: 23,
      },
    ],
    [
      {
        ...toDeviceMessageData,
        content: 23,
      },
    ],
  ])('should return false for invalid to device message', (event) => {
    expect(isValidToDeviceMessageEvent(event)).toBe(false);
  });
});

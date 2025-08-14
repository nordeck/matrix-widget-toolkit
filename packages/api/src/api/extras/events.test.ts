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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoomEvent, StateEvent, ToDeviceMessageEvent } from '../types';
import {
  isRoomEvent,
  isStateEvent,
  isValidCreateEventSchema,
  isValidPowerLevelStateEvent,
  isValidRoomEvent,
  isValidStateEvent,
  isValidToDeviceMessageEvent,
  StateEventCreateContent,
} from './events';

// Mock console.warn for tests
const originalConsoleWarn = console.warn;
beforeEach(() => {
  console.warn = vi.fn();
});

afterEach(() => {
  console.warn = originalConsoleWarn;
});

const roomEvent: RoomEvent = {
  type: 'com.example.type',
  sender: '@user-id',
  event_id: '$id',
  content: {},
  origin_server_ts: 1739189593951,
  room_id: '!room-id:example.com',
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

  it('should log warning when validation fails', () => {
    const invalidEvent = { ...roomEventData, type: undefined };
    expect(isValidRoomEvent(invalidEvent)).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      'Invalid room event:',
      expect.any(Array),
      { event: invalidEvent },
    );
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

  it('should accept stripped state event', () => {
    expect(
      isValidStateEvent({
        ...stateEventData,
        event_id: undefined,
        origin_server_ts: undefined,
      }),
    ).toBe(true);
  });

  it.each<object>([
    { type: undefined },
    { sender: undefined },
    { room_id: undefined },
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

  it('should log warning when validation fails', () => {
    const invalidEvent = { ...stateEventData, type: undefined };
    expect(isValidStateEvent(invalidEvent)).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      'Invalid state event:',
      expect.any(Array),
      { event: invalidEvent },
    );
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

  it('should log warning when validation fails', () => {
    const invalidEvent = { ...toDeviceMessageData, type: undefined };
    expect(isValidToDeviceMessageEvent(invalidEvent)).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      'Invalid to device message event:',
      expect.any(Array),
      { event: invalidEvent },
    );
  });
});

describe('isValidPowerLevelStateEvent', () => {
  it('should permit valid event', () => {
    const event: StateEvent = {
      content: {
        events: {
          'event-name': 50,
        },
        users_default: 25,
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.power_levels',
    };

    expect(isValidPowerLevelStateEvent(event)).toEqual(true);
  });

  it('should permit additional properties', () => {
    const event: StateEvent = {
      content: {
        additionalProperty: true,
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.power_levels',
    };

    expect(isValidPowerLevelStateEvent(event)).toEqual(true);
  });

  it('should deny wrong event type', () => {
    const event: StateEvent = {
      content: {},
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'another-type',
    };

    expect(isValidPowerLevelStateEvent(event)).toEqual(false);
  });

  it('should deny wrong event structure (wrong type for events_default)', () => {
    const event: StateEvent = {
      content: {
        events_default: 'test',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.power_levels',
    };

    expect(isValidPowerLevelStateEvent(event)).toEqual(false);
  });

  it('should deny wrong event structure (null value for events)', () => {
    const event: StateEvent = {
      content: {
        events: null,
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.power_levels',
    };

    expect(isValidPowerLevelStateEvent(event)).toEqual(false);
  });

  it('should deny wrong event structure (wrong type for events key-value pairs)', () => {
    const event: StateEvent = {
      content: {
        events: {
          'event-type': false,
        },
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.power_levels',
    };

    expect(isValidPowerLevelStateEvent(event)).toEqual(false);
  });
});

describe('isValidCreateEventSchema', () => {
  it('should accept valid create event', () => {
    const event: StateEvent<StateEventCreateContent> = {
      content: {
        room_version: '12',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.create',
    };

    expect(isValidCreateEventSchema(event)).toEqual(true);
  });

  it('should accept create event with content with type', () => {
    const event: StateEvent<StateEventCreateContent> = {
      content: {
        room_version: '12',
        type: 'special_room',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.create',
    };

    expect(isValidCreateEventSchema(event)).toEqual(true);
  });

  it('should accept additional properties', () => {
    const event: StateEvent<StateEventCreateContent> = {
      content: {
        room_version: '12',
        // @ts-expect-error - additionalProperty is not part of the schema but this is what we want to test
        additionalProperty: true,
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.create',
    };

    expect(isValidCreateEventSchema(event)).toEqual(true);
  });

  it('should reject wrong event type', () => {
    const event: StateEvent<StateEventCreateContent> = {
      content: {
        room_version: '12',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'another-type',
    };

    expect(isValidCreateEventSchema(event)).toEqual(false);
  });

  it('should accept room id without a server name', () => {
    const event: StateEvent<StateEventCreateContent> = {
      content: {
        room_version: '12',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.create',
    };

    expect(isValidCreateEventSchema(event)).toEqual(true);
  });

  it('should reject wrong event structure (missing content)', () => {
    // @ts-expect-error - we are in a test case
    const event: StateEvent<StateEventCreateContent> = {
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id:example.com',
      state_key: '',
      type: 'm.room.create',
    };

    expect(isValidCreateEventSchema(event)).toEqual(false);
  });

  it('should reject invalid sender', () => {
    const event: StateEvent<StateEventCreateContent> = {
      content: {
        room_version: '12',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id:example.com',
      sender: '@user-id',
      state_key: '',
      type: 'm.room.create',
    };

    expect(isValidCreateEventSchema(event)).toEqual(false);
  });

  it('should reject invalid room id', () => {
    const event: StateEvent<StateEventCreateContent> = {
      content: {
        room_version: '12',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: '!room-id',
      sender: '@user-id',
      state_key: '',
      type: 'm.room.create',
    };

    expect(isValidCreateEventSchema(event)).toEqual(false);
  });
});

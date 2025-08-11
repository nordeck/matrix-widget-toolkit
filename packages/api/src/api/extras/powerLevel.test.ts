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
import { StateEvent } from '../types';
import { StateEventCreateContent } from './events';
import {
  calculateActionPowerLevel,
  calculateRoomEventPowerLevel,
  calculateStateEventPowerLevel,
  calculateUserPowerLevel,
  hasActionPower,
  hasRoomEventPower,
  hasStateEventPower,
  ROOM_VERSION_12_CREATOR,
} from './powerLevel';

const room_version_11_create_event: StateEvent<StateEventCreateContent> = {
  content: {
    room_version: '11',
  },
  event_id: 'event-id',
  origin_server_ts: 0,
  room_id: '!room-id:example.com',
  sender: '@user-id:example.com',
  state_key: '',
  type: 'm.room.create',
};

const room_version_12_create_event: StateEvent<StateEventCreateContent> = {
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
const room_version_12_create_event_with_additional_creators: StateEvent<StateEventCreateContent> =
  {
    content: {
      room_version: '12',
      additional_creators: ['@other-creator:example.com'],
    },
    event_id: 'event-id',
    origin_server_ts: 0,
    room_id: '!room-id:example.com',
    sender: '@user-id:example.com',
    state_key: '',
    type: 'm.room.create',
  };

describe('hasRoomEventPower', () => {
  it('should permit if event is missing', () => {
    expect(
      hasRoomEventPower(
        undefined,
        room_version_11_create_event,
        'userId',
        'my-event',
      ),
    ).toEqual(true);
  });

  it('should permit if user level is high enough', () => {
    expect(
      hasRoomEventPower(
        { users: { userId: 30 }, events_default: 30 },
        room_version_11_create_event,
        'userId',
        'my-event',
      ),
    ).toEqual(true);
  });

  it('should reject if user level is too low', () => {
    expect(
      hasRoomEventPower(
        { users: { userId: 10 }, events_default: 20 },
        room_version_11_create_event,
        'userId',
        'my-event',
      ),
    ).toEqual(false);
  });
});

describe('hasStateEventPower', () => {
  it('should NOT permit if event is missing', () => {
    expect(
      hasStateEventPower(
        undefined,
        room_version_11_create_event,
        'userId',
        'my-event',
      ),
    ).toEqual(false);
  });

  it('should permit if user level is high enough', () => {
    expect(
      hasStateEventPower(
        { users: { userId: 30 }, state_default: 30 },
        room_version_11_create_event,
        'userId',
        'my-event',
      ),
    ).toEqual(true);
  });

  it('should reject if user level is too low', () => {
    expect(
      hasStateEventPower(
        { users: { userId: 10 }, state_default: 20 },
        room_version_11_create_event,
        'userId',
        'my-event',
      ),
    ).toEqual(false);
  });
});

describe('hasActionPower', () => {
  it('should permit if event is missing', () => {
    expect(
      hasActionPower(
        undefined,
        room_version_11_create_event,
        'userId',
        'invite',
      ),
    ).toEqual(true);
  });

  it('should permit if user level is high enough', () => {
    expect(
      hasActionPower(
        { users: { userId: 30 }, invite: 30 },
        room_version_11_create_event,
        'userId',
        'invite',
      ),
    ).toEqual(true);
  });

  it('should reject if user level is too low', () => {
    expect(
      hasActionPower(
        { users: { userId: 10 }, invite: 20 },
        room_version_11_create_event,
        'userId',
        'invite',
      ),
    ).toEqual(false);
  });
});

describe('calculateUserLevel', () => {
  it('should return default level if users is not part of the event', () => {
    expect(
      calculateUserPowerLevel(
        {
          users: {},
          users_default: 25,
        },
        room_version_11_create_event,
        'my-user-id',
      ),
    ).toEqual(25);
  });

  it('should return specific user level if user id is in users', () => {
    expect(
      calculateUserPowerLevel(
        {
          users: { 'my-user-id': 42 },
        },
        room_version_11_create_event,
        'my-user-id',
      ),
    ).toEqual(42);
  });

  it('should return default user level if event is empty', () => {
    expect(
      calculateUserPowerLevel({}, room_version_11_create_event, 'my-user-id'),
    ).toEqual(0);
  });

  it('should return ROOM_VERSION_12_CREATOR if user is room creator in a room version 12 room', () => {
    expect(
      calculateUserPowerLevel(
        {
          users: { '@another-user-id:example.com': 42 },
        },
        room_version_12_create_event,
        '@user-id:example.com',
      ),
    ).toEqual(ROOM_VERSION_12_CREATOR);
  });
  it('should return ROOM_VERSION_12_CREATOR if user is additional creator in a room version 12 room', () => {
    expect(
      calculateUserPowerLevel(
        {
          users: { '@another-user-id:example.com': 42 },
        },
        room_version_12_create_event_with_additional_creators,
        '@other-creator:example.com',
      ),
    ).toEqual(ROOM_VERSION_12_CREATOR);
  });
});

describe('calculateRoomEventPowerLevel', () => {
  it('should return default level for room events if event is not part of the events', () => {
    expect(
      calculateRoomEventPowerLevel(
        {
          events: {},
          events_default: 25,
        },
        'my-event',
      ),
    ).toEqual(25);
  });

  it('should return specific event level if event type is in events', () => {
    expect(
      calculateRoomEventPowerLevel(
        {
          events: { 'my-event': 42 },
        },
        'my-event',
      ),
    ).toEqual(42);
  });

  it('should return fallback event level if power levels definition is empty', () => {
    expect(calculateRoomEventPowerLevel({}, 'my-event')).toEqual(0);
  });
});

describe('calculateStateEventPowerLevel', () => {
  it('should return default level for state events if event is not part of the events', () => {
    expect(
      calculateStateEventPowerLevel(
        {
          events: {},
          state_default: 25,
        },
        room_version_11_create_event,
        'my-event',
      ),
    ).toEqual(25);
  });

  it('should return specific event level if event type is in events', () => {
    expect(
      calculateStateEventPowerLevel(
        {
          events: { 'my-event': 42 },
        },
        room_version_11_create_event,
        'my-event',
      ),
    ).toEqual(42);
  });

  it('should return fallback event level if power levels definition is empty', () => {
    expect(
      calculateStateEventPowerLevel(
        {},
        room_version_11_create_event,
        'my-event',
      ),
    ).toEqual(50);
  });
});

describe('calculateActionPowerLevel', () => {
  it.each`
    action      | level
    ${'ban'}    | ${40}
    ${'invite'} | ${41}
    ${'kick'}   | ${42}
    ${'redact'} | ${43}
  `(
    'should return "$action" action level if it is in events',
    ({ action, level }) => {
      expect(
        calculateActionPowerLevel(
          {
            ban: 40,
            invite: 41,
            kick: 42,
            redact: 43,
          },
          action,
        ),
      ).toEqual(level);
    },
  );

  it.each`
    action      | level
    ${'ban'}    | ${50}
    ${'invite'} | ${0}
    ${'kick'}   | ${50}
    ${'redact'} | ${50}
  `(
    'should return fallback "$action" action level if power levels definition is empty',
    ({ action, level }) => {
      expect(calculateActionPowerLevel({}, action)).toEqual(level);
    },
  );
});

describe('Room Version 12 Create Event', () => {
  it('should not allow m.room.tombstone events with power level 100', () => {
    expect(
      calculateStateEventPowerLevel(
        {
          users: { '@user-id:example.com': 100 },
          state_default: 100,
        },
        room_version_12_create_event,
        'm.room.tombstone',
      ),
    ).toEqual(150);
  });

  it('should allow m.room.tombstone events with power level 150', () => {
    expect(
      hasStateEventPower(
        {
          users: { '@user-id:example.com': 150 },
          state_default: 150,
        },
        room_version_12_create_event,
        '@user-id:example.com',
        'm.room.tombstone',
      ),
    ).toEqual(true);
  });

  it('should allow kick, ban, redact and invite actions as a room creator', () => {
    const plEvent = {
      users: { '@user-id:example.com': 100 },
      ban: 100,
      invite: 100,
      kick: 100,
      redact: 100,
    };
    expect(
      hasActionPower(
        plEvent,
        room_version_12_create_event,
        '@user-id:example.com',
        'ban',
      ),
    ).toEqual(true);
    expect(
      hasActionPower(
        plEvent,
        room_version_12_create_event,
        '@user-id:example.com',
        'invite',
      ),
    ).toEqual(true);
    expect(
      hasActionPower(
        plEvent,
        room_version_12_create_event,
        '@user-id:example.com',
        'kick',
      ),
    ).toEqual(true);
    expect(
      hasActionPower(
        plEvent,
        room_version_12_create_event,
        '@user-id:example.com',
        'redact',
      ),
    ).toEqual(true);
  });
  it('should not allow kick, ban, redact and invite actions when user is additional creator', () => {
    const plEvent = {
      users: { '@user-id:example.com': 100 },
      ban: 100,
      invite: 100,
      kick: 100,
      redact: 100,
    };
    expect(
      hasActionPower(
        plEvent,
        room_version_12_create_event_with_additional_creators,
        '@other-creator:example.com',
        'ban',
      ),
    ).toEqual(true);
    expect(
      hasActionPower(
        plEvent,
        room_version_12_create_event_with_additional_creators,
        '@other-creator:example.com',
        'invite',
      ),
    ).toEqual(true);
    expect(
      hasActionPower(
        plEvent,
        room_version_12_create_event_with_additional_creators,
        '@other-creator:example.com',
        'kick',
      ),
    ).toEqual(true);
    expect(
      hasActionPower(
        plEvent,
        room_version_12_create_event_with_additional_creators,
        '@other-creator:example.com',
        'redact',
      ),
    ).toEqual(true);
  });
});

describe('Creator is detected correctly in room versions 1-10 vs 11+', () => {
  it('should return true for creator in room version 11+', () => {
    const plEvent = undefined;
    for (const version of ['11', '12']) {
      expect(
        hasStateEventPower(
          plEvent,
          {
            content: {
              room_version: version,
            },
            event_id: 'event-id',
            origin_server_ts: 0,
            room_id: '!room-id:example.com',
            sender: '@user-id:example.com',
            state_key: '',
            type: 'm.room.create',
          },
          '@user-id:example.com',
          'm.room.create',
        ),
      ).toEqual(true);
    }
  });
  it('should return true for creator in room version 1-10', () => {
    const plEvent = undefined;
    for (const version of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']) {
      expect(
        hasStateEventPower(
          plEvent,
          {
            content: {
              room_version: version,
              creator: '@user-id:example.com',
            },
            event_id: 'event-id',
            origin_server_ts: 0,
            room_id: '!room-id:example.com',
            sender: '@user-id:example.com',
            state_key: '',
            type: 'm.room.create',
          },
          '@user-id:example.com',
          'm.room.create',
        ),
      ).toEqual(true);
    }
  });
});

# `@matrix-widget-toolkit/events`

[![@matrix-widget-toolkit/events](https://img.shields.io/npm/v/@matrix-widget-toolkit/events)](https://www.npmjs.com/package/@matrix-widget-toolkit/events)

This package provides Matrix helpers without widget dependencies.

They can be used in widgets but also in other types of projects, like bots or
backend services. For now, the package includes:

- Helper functions to calculate power levels, including the room creator rules
  of room version 12 ([MSC4289](https://github.com/matrix-org/matrix-spec-proposals/pull/4289)).
- Types and validators for common Matrix events (`m.room.create`,
  `m.room.power_levels`, `m.room.member`, `m.room.redaction`).
- Helpers for event relations and edits (`m.relates_to`, `m.new_content`).
- Helpers to compute room member display names and to sort events by
  `origin_server_ts`.

The helpers are also re-exported by `@matrix-widget-toolkit/api`, so widgets
don't need to depend on this package directly.

## Usage

Install it with:

```bash
yarn add @matrix-widget-toolkit/events
```

### Check power levels

All helpers take the content of the room's `m.room.power_levels` event and its
`m.room.create` event.

The examples below use this room:

```typescript
import type {
  PowerLevelsStateEvent,
  StateEvent,
  StateEventCreateContent,
} from '@matrix-widget-toolkit/events';

const alice = '@alice:example.com';
const bob = '@bob:example.com';
const carol = '@carol:example.com';

const createEvent: StateEvent<StateEventCreateContent> = {
  type: 'm.room.create',
  sender: alice,
  state_key: '',
  event_id: '$create-event-id',
  room_id: '!room-id:example.com',
  origin_server_ts: 0,
  content: { room_version: '12' },
};

const powerLevels: PowerLevelsStateEvent = {
  users: { [bob]: 100 },
  users_default: 0,
  events_default: 0,
  state_default: 50,
  events: { 'm.reaction': 10 },
  kick: 50,
};
```

#### `hasStateEventPower`

Checks if a user can send a state event. It uses the level from `events`, or
`state_default` (`50` if missing).

```typescript
import { hasStateEventPower } from '@matrix-widget-toolkit/events';

hasStateEventPower(powerLevels, createEvent, bob, 'm.room.topic'); // true
hasStateEventPower(powerLevels, createEvent, carol, 'm.room.topic'); // false
```

#### `hasRoomEventPower`

Checks if a user can send a room event. It uses the level from `events`, or
`events_default` (`0` if missing).

```typescript
import { hasRoomEventPower } from '@matrix-widget-toolkit/events';

hasRoomEventPower(powerLevels, createEvent, carol, 'm.room.message'); // true
hasRoomEventPower(powerLevels, createEvent, carol, 'm.reaction'); // false
hasRoomEventPower(powerLevels, createEvent, bob, 'm.reaction'); // true
```

#### `hasActionPower`

Checks if a user can perform one of the actions `invite`, `kick`, `ban`, or
`redact`.

```typescript
import { hasActionPower } from '@matrix-widget-toolkit/events';

hasActionPower(powerLevels, createEvent, bob, 'kick'); // true
hasActionPower(powerLevels, createEvent, carol, 'kick'); // false
```

#### `calculateUserPowerLevel` and `ROOM_VERSION_12_CREATOR`

Returns the power level of a user. The room creators of room version 12 have a
higher power level than any number, so the function returns the
`ROOM_VERSION_12_CREATOR` constant for them instead of a number.

```typescript
import {
  ROOM_VERSION_12_CREATOR,
  calculateUserPowerLevel,
} from '@matrix-widget-toolkit/events';

calculateUserPowerLevel(powerLevels, createEvent, alice); // ROOM_VERSION_12_CREATOR
calculateUserPowerLevel(powerLevels, createEvent, bob); // 100
calculateUserPowerLevel(powerLevels, createEvent, carol); // 0, from users_default

const level = calculateUserPowerLevel(powerLevels, createEvent, alice);
if (level === ROOM_VERSION_12_CREATOR) {
  // Alice is a room creator
}
```

#### `compareUserPowerLevelToNormalPowerLevel`

Compares a power level returned by `calculateUserPowerLevel` with a required
power level. Use it instead of `>=`, because it also handles
`ROOM_VERSION_12_CREATOR`.

```typescript
import {
  ROOM_VERSION_12_CREATOR,
  compareUserPowerLevelToNormalPowerLevel,
} from '@matrix-widget-toolkit/events';

compareUserPowerLevelToNormalPowerLevel(100, 150); // false
compareUserPowerLevelToNormalPowerLevel(ROOM_VERSION_12_CREATOR, 150); // true
```

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

import { StateEvent } from '../types';
import type {
  PowerLevelsActions,
  PowerLevelsStateEvent,
  StateEventCreateContent,
} from './events';
export {
  isValidPowerLevelStateEvent,
  STATE_EVENT_POWER_LEVELS,
} from './events';

/**
 * Room version 12 requires us to have something larger than Max integer for room creators.
 * This is a workaround to allow the room creator to always have the highest power level.
 */
export const ROOM_VERSION_12_CREATOR = 'ROOM_VERSION_12_CREATOR';

export type UserPowerLevelType = number | typeof ROOM_VERSION_12_CREATOR;

function compareUserPowerLevelToNormalPowerLevel(
  userPowerLevel: UserPowerLevelType,
  normalPowerLevel: number,
): boolean {
  if (userPowerLevel === ROOM_VERSION_12_CREATOR) {
    // Room version 12 creator has the highest power level.
    return true;
  }
  if (typeof userPowerLevel !== 'number') {
    // If the user power level is not a number, we cannot compare it to a normal power level.
    return false;
  }
  // Compare the user power level to the normal power level.
  return userPowerLevel >= normalPowerLevel;
}

/**
 * Check if a user has the power to send a specific room event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param createRoomStateEvent - the `m.room.create` event for the room
 * @param userId - the id of the user
 * @param eventType - the type of room event
 * @returns if true, the user has the power
 */
export function hasRoomEventPower(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  createRoomStateEvent: StateEvent<StateEventCreateContent> | undefined,
  userId: string | undefined,
  eventType: string,
): boolean {
  if (!userId) {
    // This is invalid but required to be checked due to widget API which may not know it
    throw new Error(
      'Cannot check action power without a user ID. Please provide a user ID.',
    );
  }
  const userLevel = calculateUserPowerLevel(
    powerLevelStateEvent,
    createRoomStateEvent,
    userId,
  );
  const eventLevel = calculateRoomEventPowerLevel(
    powerLevelStateEvent,
    eventType,
  );
  return compareUserPowerLevelToNormalPowerLevel(userLevel, eventLevel);
}

/**
 * Check if a user has the power to send a specific state event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param createRoomStateEvent - the `m.room.create` event for the room
 * @param userId - the id of the user
 * @param eventType - the type of state event
 * @returns if true, the user has the power
 */
export function hasStateEventPower(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  createRoomStateEvent: StateEvent<StateEventCreateContent> | undefined,
  userId: string | undefined,
  eventType: string,
): boolean {
  if (!userId) {
    // This is invalid but required to be checked due to widget API which may not know it
    throw new Error(
      'Cannot check action power without a user ID. Please provide a user ID.',
    );
  }
  const userLevel = calculateUserPowerLevel(
    powerLevelStateEvent,
    createRoomStateEvent,
    userId,
  );
  const eventLevel = calculateStateEventPowerLevel(
    powerLevelStateEvent,
    createRoomStateEvent,
    eventType,
  );
  return compareUserPowerLevelToNormalPowerLevel(userLevel, eventLevel);
}

/**
 * Check if a user has the power to perform a specific action.
 *
 * Supported actions:
 *   * invite: Invite a new user into the room
 *   * kick: Kick a user from the room
 *   * ban: Ban a user from the room
 *   * redact: Redact a message from another user
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param createRoomStateEvent - the `m.room.create` event for the room
 * @param userId - the id of the user
 * @param action - the action
 * @returns if true, the user has the power
 */
export function hasActionPower(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  createRoomStateEvent: StateEvent<StateEventCreateContent> | undefined,
  userId: string | undefined,
  action: PowerLevelsActions,
): boolean {
  if (!userId) {
    // This is invalid but required to be checked due to widget API which may not know it
    throw new Error(
      'Cannot check action power without a user ID. Please provide a user ID.',
    );
  }
  const userLevel = calculateUserPowerLevel(
    powerLevelStateEvent,
    createRoomStateEvent,
    userId,
  );
  const eventLevel = calculateActionPowerLevel(powerLevelStateEvent, action);
  return compareUserPowerLevelToNormalPowerLevel(userLevel, eventLevel);
}

/**
 * Calculate the power level of the user based on a `m.room.power_levels` event.
 *
 * Note that we return the @see UserPowerLevelType type instead of a number as Room Version 12
 * gives a Room creator (and additionalCreators) always the highest power level regardless
 * of the highest next Powerlevel number.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event.
 * @param createRoomStateEvent - the `m.room.create` event for the room.
 * @param userId - the ID of the user.
 * @returns the power level of the user.
 */
export function calculateUserPowerLevel(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  createRoomStateEvent: StateEvent<StateEventCreateContent> | undefined,
  userId: string,
): UserPowerLevelType {
  // This is practically not allowed and therefor not covered by the spec. However a js consumer could still pass an undefined userId so we handle it gracefully.
  if (!userId) {
    // If no user ID is provided, we return the default user power level or 0 if not set.
    return 0;
  }
  // If we have room version 12 we must check if the user is the creator of the room and needs to have the highest power level.
  if (
    createRoomStateEvent?.content?.room_version === '12' ||
    createRoomStateEvent?.content?.room_version === 'org.matrix.hydra.11'
  ) {
    // If the user is the creator of the room, we return the special ROOM_VERSION_12_CREATOR value.
    if (createRoomStateEvent.sender === userId) {
      return ROOM_VERSION_12_CREATOR;
    }
    if (createRoomStateEvent.content.additional_creators?.includes(userId)) {
      // If the user is an additional creator of the room, we return the special ROOM_VERSION_12_CREATOR value.
      return ROOM_VERSION_12_CREATOR;
    }
  }

  // If there is no power level state event, we assume the user has no power unless they are the room creator in which case they get PL 100.
  if (!powerLevelStateEvent) {
    if (
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(
        createRoomStateEvent?.content?.room_version ?? '1',
      )
    ) {
      // Room version 1-10 does not have a room version, so we assume the creator has power level 100.
      return createRoomStateEvent?.content?.creator === userId ? 100 : 0;
    } else {
      // For room versions 11 and above, we assume the sender has power level 100.
      return createRoomStateEvent?.sender === userId ? 100 : 0;
    }
  }
  if (powerLevelStateEvent.users && userId in powerLevelStateEvent.users) {
    // If the user is explicitly listed in the users map, return their power level.
    return powerLevelStateEvent.users[userId];
  } else if (powerLevelStateEvent.users_default !== undefined) {
    // If the user is not explicitly listed, return the default user power level.
    return powerLevelStateEvent.users_default;
  } else {
    // If no users or default is set, return 0.
    return 0;
  }
}

/**
 * Calculate the power level that a user needs send a specific room event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param eventType - the type of room event
 * @returns the power level that is needed
 */
export function calculateRoomEventPowerLevel(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  eventType: string,
): number {
  // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L14-L19
  return (
    powerLevelStateEvent?.events?.[eventType] ??
    powerLevelStateEvent?.events_default ??
    0
  );
}

/**
 * Calculate the power level that a user needs send a specific state event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param createRoomStateEvent - the `m.room.create` event
 * @param eventType - the type of state event
 * @returns the power level that is needed
 */
export function calculateStateEventPowerLevel(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  createRoomStateEvent: StateEvent<StateEventCreateContent> | undefined,
  eventType: string,
): number {
  // In room version 12 (and the beta org.matrix.hydra.11 version) we need 150 for m.room.tombstone events and it cant be changed by the user.
  if (
    (createRoomStateEvent?.content?.room_version === '12' ||
      createRoomStateEvent?.content?.room_version === 'org.matrix.hydra.11') &&
    eventType === 'm.room.tombstone'
  ) {
    return 150;
  }

  // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L14-L19
  return (
    powerLevelStateEvent?.events?.[eventType] ??
    powerLevelStateEvent?.state_default ??
    50
  );
}

/**
 * Calculate the power level that a user needs to perform an action.
 *
 * Supported actions:
 *   * invite: Invite a new user into the room
 *   * kick: Kick a user from the room
 *   * ban: Ban a user from the room
 *   * redact: Redact a message from another user
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param action - the action
 * @returns the power level that is needed
 */
export function calculateActionPowerLevel(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  action: PowerLevelsActions,
): number {
  // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L27-L32
  if (action === 'invite') {
    return powerLevelStateEvent?.[action] ?? 0;
  }

  return powerLevelStateEvent?.[action] ?? 50;
}

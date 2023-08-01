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

/**
 * The name of the power levels state event.
 */
export const STATE_EVENT_POWER_LEVELS = 'm.room.power_levels';

/**
 * The types of actions.
 */
export type PowerLevelsActions = 'invite' | 'kick' | 'ban' | 'redact';

/**
 * The content of an `m.room.power_levels` event.
 */
export type PowerLevelsStateEvent = {
  events?: { [key: string]: number };
  state_default?: number;
  events_default?: number;
  users?: { [key: string]: number };
  users_default?: number;
  ban?: number;
  invite?: number;
  kick?: number;
  redact?: number;
};

function isNumberOrUndefined(value: unknown): boolean {
  return value === undefined || typeof value === 'number';
}

function isStringToNumberMapOrUndefined(value: unknown) {
  return (
    value === undefined ||
    (value !== null &&
      typeof value === 'object' &&
      Object.entries(value).every(
        ([k, v]) => typeof k === 'string' && typeof v === 'number',
      ))
  );
}

/**
 * Validates that `event` is has a valid structure for a
 * {@link PowerLevelsStateEvent}.
 * @param event - The event to validate.
 * @returns True, if the event is valid.
 */
export function isValidPowerLevelStateEvent(
  event: StateEvent<unknown>,
): event is StateEvent<PowerLevelsStateEvent> {
  if (
    event.type !== STATE_EVENT_POWER_LEVELS ||
    typeof event.content !== 'object'
  ) {
    return false;
  }

  const content = event.content as Partial<PowerLevelsStateEvent>;

  if (!isStringToNumberMapOrUndefined(content.events)) {
    return false;
  }

  if (!isNumberOrUndefined(content.state_default)) {
    return false;
  }

  if (!isNumberOrUndefined(content.events_default)) {
    return false;
  }

  if (!isStringToNumberMapOrUndefined(content.users)) {
    return false;
  }

  if (!isNumberOrUndefined(content.users_default)) {
    return false;
  }

  if (!isNumberOrUndefined(content.ban)) {
    return false;
  }

  if (!isNumberOrUndefined(content.invite)) {
    return false;
  }

  if (!isNumberOrUndefined(content.kick)) {
    return false;
  }

  if (!isNumberOrUndefined(content.redact)) {
    return false;
  }

  return true;
}

/**
 * Check if a user has the power to send a specific room event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param userId - the id of the user
 * @param eventType - the type of room event
 * @returns if true, the user has the power
 */
export function hasRoomEventPower(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  userId: string | undefined,
  eventType: string,
): boolean {
  if (!powerLevelStateEvent) {
    // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L36-L43
    return true;
  }

  const userLevel = calculateUserPowerLevel(powerLevelStateEvent, userId);
  const eventLevel = calculateRoomEventPowerLevel(
    powerLevelStateEvent,
    eventType,
  );
  return userLevel >= eventLevel;
}

/**
 * Check if a user has the power to send a specific state event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param userId - the id of the user
 * @param eventType - the type of state event
 * @returns if true, the user has the power
 */
export function hasStateEventPower(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  userId: string | undefined,
  eventType: string,
): boolean {
  if (!powerLevelStateEvent) {
    // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L36-L43
    return true;
  }

  const userLevel = calculateUserPowerLevel(powerLevelStateEvent, userId);
  const eventLevel = calculateStateEventPowerLevel(
    powerLevelStateEvent,
    eventType,
  );
  return userLevel >= eventLevel;
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
 * @param userId - the id of the user
 * @param action - the action
 * @returns if true, the user has the power
 */
export function hasActionPower(
  powerLevelStateEvent: PowerLevelsStateEvent | undefined,
  userId: string | undefined,
  action: PowerLevelsActions,
): boolean {
  if (!powerLevelStateEvent) {
    // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L36-L43
    return true;
  }

  const userLevel = calculateUserPowerLevel(powerLevelStateEvent, userId);
  const eventLevel = calculateActionPowerLevel(powerLevelStateEvent, action);
  return userLevel >= eventLevel;
}

/**
 * Calculate the power level of the user based on a `m.room.power_levels` event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event.
 * @param userId - the ID of the user.
 * @returns the power level of the user.
 */
export function calculateUserPowerLevel(
  powerLevelStateEvent: PowerLevelsStateEvent,
  userId?: string,
): number {
  // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L8-L12
  return (
    (userId ? powerLevelStateEvent.users?.[userId] : undefined) ??
    powerLevelStateEvent.users_default ??
    0
  );
}

/**
 * Calculate the power level that a user needs send a specific room event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param eventType - the type of room event
 * @returns the power level that is needed
 */
export function calculateRoomEventPowerLevel(
  powerLevelStateEvent: PowerLevelsStateEvent,
  eventType: string,
): number {
  // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L14-L19
  return (
    powerLevelStateEvent.events?.[eventType] ??
    powerLevelStateEvent.events_default ??
    0
  );
}

/**
 * Calculate the power level that a user needs send a specific state event.
 *
 * @param powerLevelStateEvent - the content of the `m.room.power_levels` event
 * @param eventType - the type of state event
 * @returns the power level that is needed
 */
export function calculateStateEventPowerLevel(
  powerLevelStateEvent: PowerLevelsStateEvent,
  eventType: string,
): number {
  // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L14-L19
  return (
    powerLevelStateEvent.events?.[eventType] ??
    powerLevelStateEvent.state_default ??
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
  powerLevelStateEvent: PowerLevelsStateEvent,
  action: PowerLevelsActions,
): number {
  // See https://github.com/matrix-org/matrix-spec/blob/203b9756f52adfc2a3b63d664f18cdbf9f8bf126/data/event-schemas/schema/m.room.power_levels.yaml#L27-L32
  if (action === 'invite') {
    return powerLevelStateEvent?.[action] ?? 0;
  }

  return powerLevelStateEvent?.[action] ?? 50;
}

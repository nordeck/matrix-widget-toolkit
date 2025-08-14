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

import Joi from 'joi';
import { RoomEvent, StateEvent, ToDeviceMessageEvent } from '../types';

/**
 * The type of the power levels state event.
 */
export const STATE_EVENT_POWER_LEVELS = 'm.room.power_levels';

/**
 * The types of type of the create event.
 */
export const STATE_EVENT_CREATE = 'm.room.create';

/**
 * Check if the given event is a {@link StateEvent}.
 *
 * @param event - An event that is either a {@link RoomEvent} or a {@link StateEvent}.
 * @returns True, if the event is a {@link StateEvent}.
 */
export function isStateEvent(
  event: RoomEvent | StateEvent,
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

/**
 * Check if the given value is a valid {@link RoomEvent}.
 *
 * @param event - The value to check
 * @returns true if value is a valid room event, else false.
 */
// Allow any here, so that the validation works for every event
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidRoomEvent(event: unknown): event is RoomEvent<any> {
  const result = roomEventSchema.validate(event);
  if (result.error) {
    console.warn('Invalid room event:', result.error.details, { event });
    return false;
  }
  return true;
}

/**
 * Check if the given value is a valid {@link StateEvent}.
 *
 * @param event - The value to check
 * @returns true if value is a valid state event, else false.
 */
// Allow any here, so that the validation works for every event
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidStateEvent(event: unknown): event is StateEvent<any> {
  const result = stateEventSchema.validate(event);
  if (result.error) {
    console.warn('Invalid state event:', result.error.details, { event });
    return false;
  }
  return true;
}

/**
 * Check if the given value is a valid {@link ToDeviceMessageEvent}.
 *
 * @param event - The value to check
 * @returns true if value is a valid to device message, else false.
 */
export function isValidToDeviceMessageEvent(
  event: unknown,
  // Allow any here, so that the validation works for every event
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): event is ToDeviceMessageEvent<any> {
  const result = toDeviceMessageSchema.validate(event);
  if (result.error) {
    console.warn('Invalid to device message event:', result.error.details, {
      event,
    });
    return false;
  }
  return true;
}

const eventSchemaBasicProps = {
  // Do roughly check against the format
  // https://spec.matrix.org/v1.13/appendices/#common-identifier-format
  sender: Joi.string().pattern(new RegExp('^@[^\\s:]*:\\S*$')).required(),
  // Prior versions of the code had checked for a server_name. However in room version 12+ this got dropped. There is no way for us to check this here.
  room_id: Joi.string().pattern(new RegExp('^!')).required(),
};

/**
 * Base properties to validate for all events.
 */
const eventSchemaProps = {
  type: Joi.string().required(),
  content: Joi.object().required(),
  ...eventSchemaBasicProps,
};

export const roomEventSchema = Joi.object<RoomEvent>({
  ...eventSchemaProps,
  event_id: Joi.string().pattern(new RegExp('^\\$.*')).required(),
  origin_server_ts: Joi.date().timestamp('javascript').required(),
}).unknown();

export const stateEventSchema = Joi.object<StateEvent>({
  ...eventSchemaProps,
  event_id: Joi.string().pattern(new RegExp('^\\$.*')), // undefined for stripped state
  origin_server_ts: Joi.date().timestamp('javascript'), // undefined for stripped state
  state_key: Joi.string().allow('').required(),
}).unknown();

export const toDeviceMessageSchema = Joi.object<ToDeviceMessageEvent>({
  type: Joi.string().required(),
  sender: Joi.string().required(),
  encrypted: Joi.boolean().required(),
  content: Joi.object().required(),
}).unknown();

export type StateEventCreateContent = {
  room_version?: string; // Room version 1 does not have a room version, so we allow it to be undefined.
  creator?: string; // The user ID of the creator of the room.
  additional_creators?: string[]; // The user IDs of additional creators of the room.
  type?: string; // Optional room type to denote a room’s intended function outside of traditional conversation.
};

export const createEventSchema = Joi.object<
  StateEvent<StateEventCreateContent>
>({
  ...eventSchemaBasicProps,
  type: Joi.string().equal(STATE_EVENT_CREATE).required(),
  content: Joi.object({
    // Room version 1 does not have a room version, so we allow it to be undefined.
    room_version: Joi.string().optional(),
    // The user ID of the creator of the room. (only from 1-10. after that we must use the sender field)
    creator: Joi.string().optional(),
    // Room version 12 introduces the additional_creators field.
    additional_creators: Joi.array().items(Joi.string()).optional(),
    // Optional room type
    type: Joi.string().optional(),
  })
    .unknown()
    .required(),
}).unknown();

/**
 * Validates that `event` is has a valid structure for a
 * {@link StateEventCreateContent}.
 * @param event - The event to validate.
 * @returns True, if the event is valid.
 */
export function isValidCreateEventSchema(
  event: StateEvent<unknown> | undefined,
): event is StateEvent<StateEventCreateContent> {
  if (!event) {
    return true;
  }
  const result = createEventSchema.validate(event);
  if (result.error) {
    console.warn('Invalid room create message event:', result.error.details, {
      event,
    });
    return false;
  }
  return true;
}

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

export const powerLevelsEventSchema = Joi.object<
  StateEvent<PowerLevelsStateEvent>
>({
  ...eventSchemaBasicProps,
  // Strictly require to match the power levels event type
  type: Joi.string().equal(STATE_EVENT_POWER_LEVELS).required(),
  content: Joi.object({
    ban: Joi.number().optional().default(50),
    events: Joi.object().pattern(Joi.string(), Joi.number()).optional(),
    events_default: Joi.number().optional().default(0),
    invite: Joi.number().optional().default(0),
    kick: Joi.number().optional().default(50),
    notifications: Joi.object({
      room: Joi.number().optional().default(50),
    })
      .unknown()
      .optional(),
    redact: Joi.number().optional().default(50),
    state_default: Joi.number().optional().default(50),
    users: Joi.object().pattern(Joi.string(), Joi.number()).optional(),
    users_default: Joi.number().optional().default(0),
  })
    .unknown()
    .required(),
}).unknown();

/**
 * Validates that `event` is has a valid structure for a
 * {@link PowerLevelsStateEvent}.
 * @param event - The event to validate.
 * @returns True, if the event is valid.
 */
export function isValidPowerLevelStateEvent(
  event: StateEvent<unknown>,
): event is StateEvent<PowerLevelsStateEvent> {
  const result = powerLevelsEventSchema.validate(event);
  if (result.error) {
    console.warn('Invalid powerlevel event:', result.error.details, {
      event,
    });
    return false;
  }
  return true;
}

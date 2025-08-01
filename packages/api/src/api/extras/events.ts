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

/**
 * Base properties to validate for all events.
 */
const eventSchemaProps = {
  type: Joi.string().required(),
  // Do roughly check against the format
  // https://spec.matrix.org/v1.13/appendices/#common-identifier-format
  sender: Joi.string().pattern(new RegExp('^@[^\\s:]*:\\S*$')).required(),
  // Prior versions of the code had checked for a server_name. However in room version 12+ this got dropped. There is no way for us to check this here.
  room_id: Joi.string().pattern(new RegExp('^!')).required(),
  content: Joi.object().required(),
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

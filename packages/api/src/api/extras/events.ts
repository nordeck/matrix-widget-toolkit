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
  return roomEventSchema.validate(event).error === undefined;
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
  return stateEventSchema.validate(event).error === undefined;
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
  return toDeviceMessageSchema.validate(event).error === undefined;
}

/**
 * Base properties to validate for all events.
 */
const eventSchemaProps = {
  type: Joi.string().required(),
  // Do roughly check against the format
  // https://spec.matrix.org/v1.13/appendices/#common-identifier-format
  sender: Joi.string().pattern(new RegExp('^@[^\\s:]*:\\S*$')).required(),
  event_id: Joi.string().pattern(new RegExp('^\\$.*')).required(),
  room_id: Joi.string().pattern(new RegExp('^![^:]*:\\S*')).required(),
  origin_server_ts: Joi.date().timestamp('javascript').required(),
  content: Joi.object().required(),
};

export const roomEventSchema = Joi.object<RoomEvent>({
  ...eventSchemaProps,
}).unknown();

export const stateEventSchema = Joi.object<StateEvent>({
  ...eventSchemaProps,
  state_key: Joi.string().allow('').required(),
}).unknown();

export const toDeviceMessageSchema = Joi.object<ToDeviceMessageEvent>({
  type: Joi.string().required(),
  sender: Joi.string().required(),
  encrypted: Joi.boolean().required(),
  content: Joi.object().required(),
}).unknown();

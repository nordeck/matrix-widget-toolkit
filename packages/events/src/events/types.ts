/*
 * Copyright 2022-2026 Nordeck IT + Consulting GmbH
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

/**
 * Generic type for state events.
 */
export type StateEvent<T = unknown> = {
  type: string;
  sender: string;
  event_id: string;
  room_id: string;
  origin_server_ts: number;
  state_key: string;
  content: T;
};

/**
 * Generic type for room events.
 */
export type RoomEvent<T = unknown> = {
  type: string;
  sender: string;
  event_id: string;
  room_id: string;
  origin_server_ts: number;
  content: T;
  sticky?: {
    duration_ms: number;
  };
  msc4354_sticky?: {
    duration_ms: number;
  };
};

/**
 * Generic type for to device message events.
 */
export type ToDeviceMessageEvent<T = unknown> = {
  type: string;
  sender: string;
  encrypted: boolean;
  content: T;
};

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

/**
 * The content of an `m.room.create` event.
 */
export type StateEventCreateContent = {
  room_version?: string; // Room version 1 does not have a room version, so we allow it to be undefined.
  creator?: string; // The user ID of the creator of the room.
  additional_creators?: string[]; // The user IDs of additional creators of the room.
  type?: string; // Optional room type to denote a room’s intended function outside of traditional conversation.
};

/**
 * Room version 12 requires us to have something larger than Max integer for room creators.
 * This is a workaround to allow the room creator to always have the highest power level.
 */
export const ROOM_VERSION_12_CREATOR = 'ROOM_VERSION_12_CREATOR';

export type UserPowerLevelType = number | typeof ROOM_VERSION_12_CREATOR;

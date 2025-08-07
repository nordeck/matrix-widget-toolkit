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

export { generateRoomTimelineCapabilities } from './capabilities';
export { getRoomMemberDisplayName } from './displayName';
export {
  STATE_EVENT_CREATE,
  isRoomEvent,
  isStateEvent,
  isValidCreateEventSchema,
  isValidRoomEvent,
  isValidStateEvent as isValidStateEVent,
  isValidToDeviceMessageEvent,
} from './events';
export type { StateEventCreateContent } from './events';
export { WIDGET_CAPABILITY_NAVIGATE, navigateToRoom } from './navigateTo';
export type { NavigateToRoomOptions } from './navigateTo';
export { compareOriginServerTS } from './originServerTs';
export {
  STATE_EVENT_POWER_LEVELS,
  calculateUserPowerLevel,
  hasActionPower,
  hasRoomEventPower,
  hasStateEventPower,
  isValidPowerLevelStateEvent,
} from './powerLevel';
export type {
  PowerLevelsActions,
  PowerLevelsStateEvent,
  ROOM_VERSION_12_CREATOR,
  USER_POWERLEVEL_TYPE,
} from './powerLevel';
export {
  ROOM_EVENT_REDACTION,
  isValidRedactionEvent,
  observeRedactionEvents,
  redactEvent,
} from './redactions';
export type { Redaction, RedactionRoomEvent } from './redactions';
export {
  getContent,
  getOriginalEventId,
  isValidEventWithRelatesTo,
} from './relatesTo';
export type {
  EventWithRelatesTo,
  NewContentRelatesTo,
  RelatesTo,
  RoomEventOrNewContent,
} from './relatesTo';
export {
  STATE_EVENT_ROOM_MEMBER,
  isValidRoomMemberStateEvent,
} from './roomMember';
export type {
  MembershipState,
  RoomMemberStateEventContent,
} from './roomMember';

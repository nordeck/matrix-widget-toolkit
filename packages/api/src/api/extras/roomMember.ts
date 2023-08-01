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
 * The name of the room member state event.
 */
export const STATE_EVENT_ROOM_MEMBER = 'm.room.member';

/**
 * The membership state of a user.
 */
export type MembershipState = 'join' | 'invite' | 'leave' | 'ban' | 'knock';

/**
 * The content of an `m.room.member` event.
 *
 * @remarks based on https://github.com/matrix-org/matrix-spec/blob/main/data/event-schemas/schema/m.room.member.yaml
 */
export type RoomMemberStateEventContent = {
  /**
   * The membership state of the user.
   */
  membership: MembershipState;

  /**
   * The display name for this user, if any.
   */
  displayname?: string | null;

  /**
   * The avatar URL for this user, if any.
   */
  avatar_url?: string | null;
};

function isStringUndefinedOrNull(value: unknown): boolean {
  return value === undefined || value === null || typeof value === 'string';
}

/**
 * Validates that `event` is has a valid structure for a
 * {@link RoomMemberStateEventContent}.
 * @param event - The event to validate.
 * @returns True, if the event is valid.
 */
export function isValidRoomMemberStateEvent(
  event: StateEvent<unknown>,
): event is StateEvent<RoomMemberStateEventContent> {
  if (
    event.type !== STATE_EVENT_ROOM_MEMBER ||
    typeof event.content !== 'object'
  ) {
    return false;
  }

  const content = event.content as Partial<RoomMemberStateEventContent>;

  if (typeof content.membership !== 'string') {
    return false;
  }

  if (!isStringUndefinedOrNull(content.displayname)) {
    return false;
  }

  // the avatar_url shouldn't be null, but some implementations
  // set it as a valid value
  if (!isStringUndefinedOrNull(content.avatar_url)) {
    return false;
  }

  return true;
}

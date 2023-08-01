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
import { RoomMemberStateEventContent } from './roomMember';

/**
 * Generate a unique displayname of a user that is consistent across Matrix clients.
 *
 * @remarks The algorithm is based on https://spec.matrix.org/v1.1/client-server-api/#calculating-the-display-name-for-a-user
 *
 * @param member - the member to generate a name for.
 * @param allRoomMembers - a list of all members of the same room.
 * @returns the displayname that is unique in given the set of all room members.
 */
export function getRoomMemberDisplayName(
  member: StateEvent<RoomMemberStateEventContent>,
  allRoomMembers: StateEvent<RoomMemberStateEventContent>[] = [],
): string {
  // If the m.room.member state event has no displayname field, or if that field
  // has a null value, use the raw user id as the display name.
  if (typeof member.content.displayname !== 'string') {
    return member.state_key;
  }

  // If the m.room.member event has a displayname which is unique among members of
  // the room with membership: join or membership: invite, ...
  const hasDuplicateDisplayName = allRoomMembers.some(
    (m) =>
      // same room
      m.room_id === member.room_id &&
      // not the own event
      m.state_key !== member.state_key &&
      // only join or invite state
      ['join', 'invite'].includes(m.content.membership) &&
      // same displayname
      m.content.displayname === member.content.displayname,
  );

  if (!hasDuplicateDisplayName) {
    // ... use the given displayname as the user-visible display name.
    return member.content.displayname;
  } else {
    // The m.room.member event has a non-unique displayname. This should be
    // disambiguated using the user id, for example “display name (@id:homeserver.org)”.
    return `${member.content.displayname} (${member.state_key})`;
  }
}

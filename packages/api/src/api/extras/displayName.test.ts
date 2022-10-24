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
import { getRoomMemberDisplayName } from './displayName';
import { MembershipState, RoomMemberStateEventContent } from './roomMember';

function createRoomMember(
  state_key: string,
  displayname?: string,
  membership: MembershipState = 'join',
  room_id = '!roomId'
): StateEvent<RoomMemberStateEventContent> {
  return {
    content: { membership, displayname },
    type: 'm.room.member',
    state_key,
    sender: '',
    event_id: '',
    origin_server_ts: 0,
    room_id,
  };
}

describe('getRoomMemberDisplayName', () => {
  it('should use state_key of single user', () => {
    expect(
      getRoomMemberDisplayName(createRoomMember('@my-user:matrix.to'))
    ).toEqual('@my-user:matrix.to');
  });

  it('should use displayname of single user', () => {
    expect(
      getRoomMemberDisplayName(
        createRoomMember('@my-user:matrix.to', 'My User')
      )
    ).toEqual('My User');
  });

  it('should handle duplicate displayname with join', () => {
    expect(
      getRoomMemberDisplayName(
        createRoomMember('@my-user:matrix.to', 'My User', 'join'),
        [
          createRoomMember('@my-user:matrix.to', 'My User', 'join'),
          createRoomMember('@another-user:matrix.to', 'My User', 'join'),
        ]
      )
    ).toEqual('My User (@my-user:matrix.to)');
  });

  it('should handle duplicate displayname with invite', () => {
    expect(
      getRoomMemberDisplayName(
        createRoomMember('@my-user:matrix.to', 'My User', 'join'),
        [
          createRoomMember('@my-user:matrix.to', 'My User', 'join'),
          createRoomMember('@another-user:matrix.to', 'My User', 'invite'),
        ]
      )
    ).toEqual('My User (@my-user:matrix.to)');
  });

  it('should ignore duplicate displayname with ban', () => {
    expect(
      getRoomMemberDisplayName(
        createRoomMember('@my-user:matrix.to', 'My User', 'join'),
        [
          createRoomMember('@my-user:matrix.to', 'My User', 'join'),
          createRoomMember('@another-user:matrix.to', 'My User', 'ban'),
        ]
      )
    ).toEqual('My User');
  });

  it('should ignore duplicate displayname from another room', () => {
    expect(
      getRoomMemberDisplayName(
        createRoomMember('@my-user:matrix.to', 'My User', 'join'),
        [
          createRoomMember('@my-user:matrix.to', 'My User', 'join'),
          createRoomMember(
            '@another-user:matrix.to',
            'My User',
            'join',
            '!anotherRoomId'
          ),
        ]
      )
    ).toEqual('My User');
  });
});

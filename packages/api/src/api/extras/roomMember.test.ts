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
import { isValidRoomMemberStateEvent } from './roomMember';

describe('isValidRoomMemberStateEvent', () => {
  it('should permit valid event', () => {
    const event: StateEvent = {
      content: {
        membership: 'join',
        displayname: 'Max Mustermann',
        avatar_url: '…',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: 'room-id',
      sender: 'user-id',
      state_key: '',
      type: 'm.room.member',
    };

    expect(isValidRoomMemberStateEvent(event)).toEqual(true);
  });

  it('should permit null values', () => {
    const event: StateEvent = {
      content: {
        membership: 'join',
        displayname: null,
        avatar_url: null,
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: 'room-id',
      sender: 'user-id',
      state_key: '',
      type: 'm.room.member',
    };

    expect(isValidRoomMemberStateEvent(event)).toEqual(true);
  });

  it('should permit additional properties', () => {
    const event: StateEvent = {
      content: {
        membership: 'join',
        displayname: 'Max Mustermann',
        avatar_url: '…',
        additionalProperty: true,
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: 'room-id',
      sender: 'user-id',
      state_key: '',
      type: 'm.room.member',
    };

    expect(isValidRoomMemberStateEvent(event)).toEqual(true);
  });

  it('should deny wrong event type', () => {
    const event: StateEvent = {
      content: {},
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: 'room-id',
      sender: 'user-id',
      state_key: '',
      type: 'another-type',
    };

    expect(isValidRoomMemberStateEvent(event)).toEqual(false);
  });

  it('should deny wrong event structure (missing membership)', () => {
    const event: StateEvent = {
      content: {
        displayname: 'Max Mustermann',
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: 'room-id',
      sender: 'user-id',
      state_key: '',
      type: 'm.room.member',
    };

    expect(isValidRoomMemberStateEvent(event)).toEqual(false);
  });

  it('should deny wrong event structure (wrong type for displayname)', () => {
    const event: StateEvent = {
      content: {
        membership: 'join',
        displayname: false,
      },
      event_id: 'event-id',
      origin_server_ts: 0,
      room_id: 'room-id',
      sender: 'user-id',
      state_key: '',
      type: 'm.room.member',
    };

    expect(isValidRoomMemberStateEvent(event)).toEqual(false);
  });
});

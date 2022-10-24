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

import { isValidRoomMessageEvent } from './roomMessageEvent';

describe('isValidRoomMessageEvent', () => {
  it('should accept event', () => {
    expect(
      isValidRoomMessageEvent({
        content: {
          msgtype: 'm.text',
          body: 'My message',
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'm.room.message',
      })
    ).toBe(true);
  });

  it('should accept additional properties', () => {
    expect(
      isValidRoomMessageEvent({
        content: {
          msgtype: 'm.text',
          body: 'My message',
          additional: 'tmp',
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'm.room.message',
      })
    ).toBe(true);
  });

  it.each<Object>([
    { msgtype: undefined },
    { msgtype: null },
    { msgtype: 5 },
    { body: undefined },
    { body: null },
    { body: 5 },
  ])('should reject event with patch %j', (patch: Object) => {
    expect(
      isValidRoomMessageEvent({
        content: {
          msgtype: 'm.text',
          body: 'My message',
          ...patch,
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'm.room.message',
      })
    ).toBe(false);
  });
});

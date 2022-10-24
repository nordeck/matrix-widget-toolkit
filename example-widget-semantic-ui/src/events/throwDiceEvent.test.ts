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

import { isValidThrowDiceEvent } from './throwDiceEvent';

describe('isValidThrowDiceEvent', () => {
  it('should accept event', () => {
    expect(
      isValidThrowDiceEvent({
        content: {
          pips: 5,
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'net.nordeck.throw_dice',
      })
    ).toBe(true);
  });

  it('should accept additional properties', () => {
    expect(
      isValidThrowDiceEvent({
        content: {
          pips: 5,
          additional: 'tmp',
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'net.nordeck.throw_dice',
      })
    ).toBe(true);
  });

  it.each<Object>([{ pips: undefined }, { pips: null }, { pips: 'text' }])(
    'should reject event with patch %j',
    (patch: Object) => {
      expect(
        isValidThrowDiceEvent({
          content: {
            name: 'Room',
            ...patch,
          },
          event_id: '$event-id',
          origin_server_ts: 0,
          room_id: '!room-id',
          sender: '@user-id',
          type: 'net.nordeck.throw_dice',
        })
      ).toBe(false);
    }
  );
});

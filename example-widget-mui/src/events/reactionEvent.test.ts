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

import { isValidReactionEvent } from './reactionEvent';

describe('isValidReactionEvent', () => {
  it('should accept event', () => {
    expect(
      isValidReactionEvent({
        content: {
          'm.relates_to': {
            rel_type: 'm.annotation',
            event_id: '$event-0',
            key: 'X',
          },
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'm.reaction',
      })
    ).toBe(true);
  });

  it('should accept additional properties', () => {
    expect(
      isValidReactionEvent({
        content: {
          'm.relates_to': {
            rel_type: 'm.annotation',
            event_id: '$event-0',
            key: 'X',
            additional: 'tmp',
          },
          additional: 'tmp',
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'm.reaction',
      })
    ).toBe(true);
  });

  it.each<Object>([
    { 'm.relates_to': undefined },
    { 'm.relates_to': null },
    { 'm.relates_to': 'text' },
  ])('should reject event with patch %j', (patch: Object) => {
    expect(
      isValidReactionEvent({
        content: {
          'm.relates_to': {
            rel_type: 'm.annotation',
            event_id: '$event-0',
            key: 'X',
          },
          ...patch,
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'm.reaction',
      })
    ).toBe(false);
  });

  it.each<Object>([
    { rel_type: undefined },
    { rel_type: null },
    { rel_type: 5 },
    { event_id: undefined },
    { event_id: null },
    { event_id: 5 },
    { key: undefined },
    { key: null },
    { key: 5 },
  ])('should reject relation with patch %j', (patch: Object) => {
    expect(
      isValidReactionEvent({
        content: {
          'm.relates_to': {
            rel_type: 'm.annotation',
            event_id: '$event-0',
            key: 'X',
            ...patch,
          },
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id',
        sender: '@user-id',
        type: 'm.reaction',
      })
    ).toBe(false);
  });
});

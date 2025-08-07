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

import { describe, expect, it } from 'vitest';
import {
  getContent,
  getOriginalEventId,
  isValidEventWithRelatesTo,
  RoomEventOrNewContent,
} from './relatesTo';

const normalEvent = {
  event_id: 'event-normal',
  content: { hello: 'world' },
} as Partial<
  RoomEventOrNewContent<{ hello: string }>
> as RoomEventOrNewContent<{ hello: string }>;

function relatesToEvent(rel_type: string) {
  return {
    event_id: 'event-relates-to',
    content: {
      'm.new_content': {
        hello: 'world',
      },
      'm.relates_to': {
        event_id: 'event-original',
        rel_type,
      },
    },
  } as Partial<
    RoomEventOrNewContent<{ hello: string }>
  > as RoomEventOrNewContent<{ hello: string }>;
}

describe('getOriginalEventId', () => {
  it('should return the event id of the original event if it contains a "m.replace" relation', () => {
    expect(getOriginalEventId(relatesToEvent('m.replace'))).toEqual(
      'event-original',
    );
  });

  it('should return the event id of the event if it contains another relation', () => {
    expect(getOriginalEventId(relatesToEvent('m.reference'))).toEqual(
      'event-relates-to',
    );
  });

  it('should return the event id of the event if it does not contains a relation', () => {
    expect(getOriginalEventId(normalEvent)).toEqual('event-normal');
  });
});

describe('getContent', () => {
  it('should return the new content if it contains a "m.new_content" content', () => {
    expect(getContent(relatesToEvent('m.reference'))).toEqual({
      hello: 'world',
    });
  });

  it('should return the normal content if it does not contains a "m.new_content" content', () => {
    expect(getContent(normalEvent)).toEqual({ hello: 'world' });
  });
});

describe('isValidEventWithRelatesTo', () => {
  it('should accept event', () => {
    expect(
      isValidEventWithRelatesTo({
        content: {
          'm.relates_to': {
            rel_type: 'm.reference',
            event_id: '$event-0',
          },
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id:example.com',
        sender: '@user-id',
        type: 'm.room.message',
      }),
    ).toBe(true);
  });

  it('should accept additional properties', () => {
    expect(
      isValidEventWithRelatesTo({
        content: {
          'm.relates_to': {
            rel_type: 'm.reference',
            event_id: '$event-0',
            additional: 'tmp',
          },
          additional: 'tmp',
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id:example.com',
        sender: '@user-id',
        type: 'm.room.message',
      }),
    ).toBe(true);
  });

  it.each<object>([
    { 'm.relates_to': undefined },
    { 'm.relates_to': null },
    { 'm.relates_to': 'text' },
  ])('should reject event with patch %j', (patch: object) => {
    expect(
      isValidEventWithRelatesTo({
        content: {
          'm.relates_to': {
            rel_type: 'm.reference',
            event_id: '$event-0',
          },
          ...patch,
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id:example.com',
        sender: '@user-id',
        type: 'm.room.message',
      }),
    ).toBe(false);
  });

  it.each<object>([
    { rel_type: undefined },
    { rel_type: null },
    { rel_type: 5 },
    { event_id: undefined },
    { event_id: null },
    { event_id: 5 },
  ])('should reject relation with patch %j', (patch: object) => {
    expect(
      isValidEventWithRelatesTo({
        content: {
          'm.relates_to': {
            rel_type: 'm.reference',
            event_id: '$event-0',
            ...patch,
          },
        },
        event_id: '$event-id',
        origin_server_ts: 0,
        room_id: '!room-id:example.com',
        sender: '@user-id',
        type: 'm.room.message',
      }),
    ).toBe(false);
  });
});

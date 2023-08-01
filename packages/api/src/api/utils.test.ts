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

import {
  EventDirection,
  IRoomEvent,
  Symbols,
  WidgetEventCapability,
} from 'matrix-widget-api';
import {
  convertToRawCapabilities,
  equalsSet,
  isDefined,
  isInRoom,
  subtractSet,
  unique,
} from './utils';

describe('convertToRawCapabilities', () => {
  it('should convert capabilities object to raw strings', () => {
    const capabilities = [
      'my.capability',
      WidgetEventCapability.forStateEvent(
        EventDirection.Receive,
        'm.room.name',
      ),
    ];
    const rawCapabilities = convertToRawCapabilities(capabilities);

    expect(rawCapabilities).toEqual([
      'my.capability',
      'org.matrix.msc2762.receive.state_event:m.room.name',
    ]);
  });
});

describe('isDefined', () => {
  it('should be defined for non null/undefined values', () => {
    expect(isDefined(true)).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined('test')).toBe(true);
    expect(isDefined({})).toBe(true);
  });

  it('should not be defined for non null values', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('should not be defined for non undefined values', () => {
    expect(isDefined(undefined)).toBe(false);
  });
});

describe('unique', () => {
  it('should filter out duplicate values', () => {
    const items = ['a', 'b', 'a', 'c', 'd', 'd'];
    expect(unique(items)).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('equalsSet', () => {
  it('should return true if sets as equal', () => {
    expect(equalsSet(new Set(['a', 'b']), new Set(['a', 'b']))).toEqual(true);
  });

  it('should return false if set are different', () => {
    expect(equalsSet(new Set(['a', 'b']), new Set(['b']))).toEqual(false);
  });
});

describe('subtractSet', () => {
  it('should subtract one set from the other', () => {
    expect(
      subtractSet(new Set(['a', 'b', 'c']), new Set(['a', 'b', 'd', 'e'])),
    ).toEqual(new Set(['c']));
  });
});

describe('isInRoom', () => {
  let event: IRoomEvent;

  beforeEach(() => {
    event = {
      type: 'com.example.test',
      event_id: 'event-id',
      origin_server_ts: 42,
      sender: 'user-id',
      unsigned: {},
      content: {},
      room_id: 'test-room',
    };
  });

  it('should return false if event is not for current room and no room ids are passed', () => {
    expect(isInRoom(event, 'another-room')).toEqual(false);
  });

  it('should return true if event is for current room and no room ids are passed', () => {
    expect(isInRoom(event, 'test-room')).toEqual(true);
  });

  it('should return true if wildcard room ids is passed', () => {
    expect(isInRoom(event, 'another-room', Symbols.AnyRoom)).toEqual(true);
  });

  it('should return true if matches any of room ids', () => {
    expect(isInRoom(event, 'another-room', ['my-room', 'test-room'])).toEqual(
      true,
    );
  });

  it('should return false if not matches any of room ids', () => {
    expect(isInRoom(event, 'another-room', ['my-room'])).toEqual(false);
  });
});

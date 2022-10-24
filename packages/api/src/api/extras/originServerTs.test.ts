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

import { RoomEvent } from '../types';
import { compareOriginServerTS } from './originServerTs';

describe('compareOriginServerTS', () => {
  function createEvent(originServerTs: number): RoomEvent {
    return {
      origin_server_ts: originServerTs,
    } as Partial<RoomEvent> as RoomEvent;
  }

  it('should sort earlier events first (a equals b)', () => {
    const eventA = createEvent(10000);
    const eventB = createEvent(10000);

    expect(compareOriginServerTS(eventA, eventB)).toEqual(0);
  });

  it('should sort earlier events first (b before a)', () => {
    const eventA = createEvent(10000);
    const eventB = createEvent(20000);

    expect(compareOriginServerTS(eventA, eventB)).toBeLessThan(0);
  });

  it('should sort earlier events first (a before b)', () => {
    const eventA = createEvent(20000);
    const eventB = createEvent(10000);

    expect(compareOriginServerTS(eventA, eventB)).toBeGreaterThan(0);
  });
});

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

import { Symbols } from 'matrix-widget-api';
import { describe, expect, it } from 'vitest';
import { generateRoomTimelineCapabilities } from './capabilities';

describe('generateRoomTimelineCapabilities', () => {
  it('should request permissions for multiple rooms', () => {
    expect(generateRoomTimelineCapabilities(['!room1', '!room2'])).toEqual([
      'org.matrix.msc2762.timeline:!room1',
      'org.matrix.msc2762.timeline:!room2',
    ]);
  });

  it('should request permissions for all rooms', () => {
    expect(generateRoomTimelineCapabilities(Symbols.AnyRoom)).toEqual([
      'org.matrix.msc2762.timeline:*',
    ]);
  });

  it('should handle empty room array', () => {
    expect(generateRoomTimelineCapabilities([])).toEqual([]);
  });
});

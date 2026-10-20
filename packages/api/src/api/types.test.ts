/*
 * Copyright 2026 Nordeck IT + Consulting GmbH
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

import { IRoomEvent } from 'matrix-widget-api';
import { describe, expectTypeOf, it } from 'vitest';
import { RoomEvent, StateEvent } from './types';

/**
 * Check for diverging upstream `IRoomEvent` from the Widget API
 */
describe('event types', () => {
  type Content = { key: string };
  // Flattens an intersection, because `toEqualTypeOf` doesn't treat it as equal
  // to the same properties in a single object type.
  type Flatten<T> = { [K in keyof T]: T[K] };

  it('should match the room events of matrix-widget-api', () => {
    expectTypeOf<RoomEvent<Content>>().toEqualTypeOf<
      Flatten<
        Omit<IRoomEvent, 'content' | 'state_key' | 'unsigned'> & {
          content: Content;
        }
      >
    >();
  });

  it('should match the state events of matrix-widget-api', () => {
    expectTypeOf<StateEvent<Content>>().toEqualTypeOf<
      Flatten<
        Omit<
          IRoomEvent,
          'content' | 'unsigned' | 'state_key' | 'sticky' | 'msc4354_sticky'
        > & {
          state_key: string;
          content: Content;
        }
      >
    >();
  });
});

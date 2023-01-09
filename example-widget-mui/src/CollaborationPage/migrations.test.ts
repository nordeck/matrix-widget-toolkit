/*
 * Copyright 2023 Nordeck IT + Consulting GmbH
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

import { generateInitSchemaChange } from './migrations';

describe('migrations', () => {
  it('should generate initial migration', () => {
    expect(generateInitSchemaChange()).toEqual(
      new Uint8Array([
        133, 111, 74, 131, 36, 228, 87, 239, 1, 44, 0, 2, 0, 0, 1, 1, 0, 0, 0,
        6, 21, 12, 52, 1, 66, 3, 86, 3, 87, 1, 112, 2, 126, 4, 116, 101, 120,
        116, 5, 99, 111, 117, 110, 116, 2, 126, 4, 1, 126, 0, 24, 0, 2, 0,
      ])
    );
  });
});

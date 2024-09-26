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
import { getColor } from './getColor';

describe('getColor', () => {
  it('should generate stable colors from ids', () => {
    expect(getColor('@oliver.sand:matrix.org')).toBe('#ac3ba8');
    expect(getColor('!OFRzoSUQYSjIXMEZDS:datanauten.de')).toBe('#368bd6');
    expect(getColor('!vbSFpwCIcbnazhtFTT:matrix.org')).toBe('#0DBD8B');
  });
});

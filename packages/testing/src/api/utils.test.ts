/*
 * Copyright 2024 Nordeck IT + Consulting GmbH
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
import { deepEqual, uniqueId } from './utils';

describe('uniqueId', () => {
  it('should generate unique ids with a prefix', () => {
    const id1 = uniqueId('$event-');
    const id2 = uniqueId('$event-');
    expect(id1).not.toEqual(id2);
    expect(id1).toMatch(/^\$event-\d+$/);
    expect(id2).toMatch(/^\$event-\d+$/);
  });
});

describe('deepEqual', () => {
  it('should return true for deeply equal objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });

  it('should return false for objects with different values', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it('should return false for objects with different keys', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { d: 2 } };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it('should return true for deeply equal arrays', () => {
    const arr1 = [1, [2, 3]];
    const arr2 = [1, [2, 3]];
    expect(deepEqual(arr1, arr2)).toBe(true);
  });

  it('should return false for arrays with different values', () => {
    const arr1 = [1, [2, 3]];
    const arr2 = [1, [2, 4]];
    expect(deepEqual(arr1, arr2)).toBe(false);
  });
});

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

/**
 * Determines a number for a given Matrix ID or room ID, helps disambiguating users
 * who are trying to impersonate someone else.
 *
 * {@link https://github.com/element-hq/compound-web/blob/5950e6827aaaca5a0b2540093f0b168ca590e8ca/src/components/Avatar/useIdColorHash.ts#L23}
 * @copyright Copyright 2023  New Vector Ltd
 *
 * @param id - a Matrix ID or room ID
 * @returns a hash of the ID provided
 */
export function useIdColorHash(id: string): number {
  const MIN = 1;
  const MAX = 6;
  // Sum up the values of all the char codes in the string
  const charCodeSum = id.split('').reduce((sum, char) => {
    return sum + char.charCodeAt(0);
  }, 0);
  return (charCodeSum % MAX) + MIN;
}

export const isColorHash = (value: number): value is 1 | 2 | 3 | 4 | 5 | 6 => {
  return [1, 2, 3, 4, 5, 6].includes(value);
};

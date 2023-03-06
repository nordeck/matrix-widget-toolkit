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

import { split } from 'lodash';

// Based on the way Element selects the initial letter
// https://github.com/matrix-org/matrix-react-sdk/blob/667ec166d736dfb0ac49f67398a8b7a13db7d5ef/src/Avatar.ts#L121
export function getInitialLetter(name: string): string | undefined {
  if (name.length < 1) {
    return undefined;
  }

  const initial = name[0];
  if ((initial === '@' || initial === '#' || initial === '+') && name[1]) {
    name = name.substring(1);
  }

  // rely on the grapheme cluster splitter in lodash so that we don't break apart compound emojis
  return split(name, '', 1)[0].toUpperCase();
}

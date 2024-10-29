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

export function getColor(id: string): string {
  // Same colors and algorithm as Element is using, to get the same results:
  // https://github.com/matrix-org/matrix-react-sdk/blob/667ec166d736dfb0ac49f67398a8b7a13db7d5ef/src/Avatar.ts#L91
  const defaultColors = ['#007a61', '#368bd6', '#ac3ba8'];
  let total = 0;
  for (let i = 0; i < id.length; ++i) {
    total += id.charCodeAt(i);
  }
  const colorIndex = total % defaultColors.length;

  return defaultColors[colorIndex];
}

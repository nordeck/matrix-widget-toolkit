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

/**
 * Generate a list of capabilities to access the timeline of other rooms.
 * If enabled, all previously or future capabilities will apply to _all_
 * selected rooms.
 * If `Symbols.AnyRoom` is passed, this is expanded to all joined
 * or invited rooms the client is able to see, current and future.
 *
 * @param roomIds - a list of room ids or `@link Symbols.AnyRoom`.
 * @returns the generated capabilities.
 */
export function generateRoomTimelineCapabilities(
  roomIds: string[] | Symbols.AnyRoom
): string[] {
  if (roomIds === Symbols.AnyRoom) {
    return ['org.matrix.msc2762.timeline:*'];
  }

  if (Array.isArray(roomIds)) {
    return roomIds.map((id) => `org.matrix.msc2762.timeline:${id}`);
  }

  return [];
}

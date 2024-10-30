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

import {
  Capability,
  IRoomEvent,
  Symbols,
  WidgetEventCapability,
} from 'matrix-widget-api';

export function convertToRawCapabilities(
  rawCapabilities: Array<WidgetEventCapability | Capability>,
): string[] {
  return rawCapabilities.map((c) => (typeof c === 'string' ? c : c.raw));
}

export function isDefined<T>(arg: T | null | undefined): arg is T {
  return arg !== null && arg !== undefined;
}

export function unique<T>(items: Iterable<T>): T[] {
  return Array.from(new Set<T>(items));
}

// These 2 functions originally were using lodash. These are replacements for them.
export const uniqueId = (
  (counter) =>
  (str = '') =>
    `${str}${++counter}`
)(0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is a generic deepEqual function therefore it can accept any type.
export function deepEqual(x: any, y: any): boolean {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === 'object' && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every((key) => deepEqual(x[key], y[key]))
    : x === y;
}

export function equalsSet<T>(as: Set<T>, bs: Set<T>): boolean {
  if (as.size !== bs.size) {
    return false;
  }
  for (const a of Array.from(as)) {
    if (!bs.has(a)) {
      return false;
    }
  }
  return true;
}

export function subtractSet<T>(as: Set<T>, bs: Set<T>): Set<T> {
  const result = new Set(as);
  bs.forEach((v) => result.delete(v));
  return result;
}

export function isInRoom(
  matrixEvent: IRoomEvent,
  currentRoomId: string,
  roomIds?: string[] | Symbols.AnyRoom,
): boolean {
  if (!roomIds) {
    return matrixEvent.room_id === currentRoomId;
  }

  if (typeof roomIds === 'string') {
    if (roomIds !== Symbols.AnyRoom) {
      throw Error(`Unknown room id symbol: ${roomIds}`);
    }

    return true;
  }

  return roomIds.includes(matrixEvent.room_id);
}

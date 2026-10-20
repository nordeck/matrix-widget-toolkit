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

export function isDefined<T>(arg: T | null | undefined): arg is T {
  return arg !== null && arg !== undefined;
}

export function unique<T>(items: Iterable<T>): T[] {
  return Array.from(new Set<T>(items));
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

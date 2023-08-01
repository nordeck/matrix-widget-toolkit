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

import { RoomEvent } from '../types';

/**
 * Defines a relation to another event.
 */
export type RelatesTo<RelationType extends string> = {
  /**
   * The event id of the other event.
   */
  event_id: string;
  /**
   * The relation to the other event.
   */
  rel_type: RelationType;
};

/**
 * Content of a room event that relates to another event.
 */
export type EventWithRelatesTo<RelationType extends string> = RoomEvent<{
  /**
   * A reference to the event that it relates to.
   */
  'm.relates_to': RelatesTo<RelationType>;
}>;

/**
 * Content of a room event that replaces an existing event with
 * the "m.replace" relation, which means that the content of the
 * previous event is fully replaced.
 */
export type NewContentRelatesTo<T> =
  EventWithRelatesTo<'m.replace'>['content'] & {
    /**
     * The new content of the event.
     */
    'm.new_content': T;
  };

/**
 * A room event that either contains the content directly or contains an
 * "m.new_content" object.
 */
export type RoomEventOrNewContent<T = unknown> = RoomEvent<
  T | NewContentRelatesTo<T>
>;

/**
 * Get the original event id, or the event id of the current event if it
 * doesn't relates to another event.
 * @param event - The room event.
 * @returns The event id of the original event, or the current event id.
 */
export function getOriginalEventId<T>(event: RoomEventOrNewContent<T>): string {
  const newContentRelatesTo = event.content as Partial<NewContentRelatesTo<T>>;

  if (newContentRelatesTo['m.relates_to']?.rel_type === 'm.replace') {
    return newContentRelatesTo['m.relates_to']?.event_id ?? event.event_id;
  }

  return event.event_id;
}

/**
 * Get the content of the event, independent from whether it contains the
 * content directly or contains a "m.new_content" key.
 * @param event - The room event.
 * @returns Only the content of the room event.
 */
export function getContent<T>(event: RoomEventOrNewContent<T>): T {
  const newContentRelatesTo = event.content as Partial<NewContentRelatesTo<T>>;
  return newContentRelatesTo['m.new_content'] ?? (event.content as T);
}

/**
 * Validates that `event` has a valid structure for a
 * {@link EventWithRelatesTo}.
 * @param event - The event to validate.
 * @returns True, if the event is valid.
 */
export function isValidEventWithRelatesTo(
  event: RoomEvent,
): event is EventWithRelatesTo<string> {
  if (!event.content || typeof event.content !== 'object') {
    return false;
  }

  const relatedEvent = event as EventWithRelatesTo<string>;

  if (
    !relatedEvent.content['m.relates_to'] ||
    typeof relatedEvent.content['m.relates_to'] !== 'object'
  ) {
    return false;
  }

  if (
    typeof relatedEvent.content['m.relates_to'].rel_type !== 'string' ||
    typeof relatedEvent.content['m.relates_to'].event_id !== 'string'
  ) {
    return false;
  }

  return true;
}

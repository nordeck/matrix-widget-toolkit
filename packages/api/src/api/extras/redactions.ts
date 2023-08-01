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

import { filter, Observable } from 'rxjs';
import { RoomEvent, WidgetApi } from '../types';

/**
 * The name of the redaction room event.
 */
export const ROOM_EVENT_REDACTION = 'm.room.redaction';

/**
 * The content of an `m.room.redaction` event.
 */
export type Redaction = {
  /**
   * The id of the event that is redacted.
   */
  redacts: string;
};

/**
 * Types a {@link RoomEvent} to include the properties of a redaction.
 *
 * @remarks The redaction event is a special snowflake. The actual data is
 *          outside the content to make it readable without having to decrypt
 *          it.
 */
export type RedactionRoomEvent = RoomEvent<Record<string, never>> & Redaction;

/**
 * Check whether the format of a redaction event is valid.
 * @param event - The event to check.
 * @returns True if the event format is valid, otherwise false.
 */
export function isValidRedactionEvent(
  event: RoomEvent<unknown>,
): event is RedactionRoomEvent {
  if (
    event.type === ROOM_EVENT_REDACTION &&
    typeof (event as Partial<RedactionRoomEvent>).redacts === 'string'
  ) {
    return true;
  }

  return false;
}

/**
 * Redacts an event in the current room.
 * @param widgetApi - An instance of the widget API.
 * @param eventId - The id of the event to redact.
 * @returns The redaction event that was send to the room.
 */
export async function redactEvent(
  widgetApi: WidgetApi,
  eventId: string,
): Promise<RedactionRoomEvent> {
  const result = await widgetApi.sendRoomEvent<Redaction>(
    ROOM_EVENT_REDACTION,
    { redacts: eventId },
  );
  // The redaction event is special and needs to be casted, as the widget
  // toolkit assumes that the content of an event is returned as we send it.
  // However for redactions the content is copied directly into the event to
  // make it available without decrypting the content.
  return result as unknown as RedactionRoomEvent;
}

/**
 * Observes redaction events in the current room.
 * @param widgetApi - An instance of the widget API.
 * @returns An observable of validated redaction events.
 */
export function observeRedactionEvents(
  widgetApi: WidgetApi,
): Observable<RedactionRoomEvent> {
  return widgetApi
    .observeRoomEvents(ROOM_EVENT_REDACTION)
    .pipe(filter(isValidRedactionEvent));
}

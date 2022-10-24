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

import { from, lastValueFrom } from 'rxjs';
import { RoomEvent, WidgetApi } from '../types';
import {
  isValidRedactionEvent,
  observeRedactionEvents,
  redactEvent,
  RedactionRoomEvent,
} from './redactions';

describe('isValidRedactionEvent', () => {
  it('should succeed for non redaction events', () => {
    const redactionEvent = {
      type: 'm.room.redaction',
      redacts: 'event-1234',
    } as Partial<RedactionRoomEvent> as RedactionRoomEvent;

    expect(isValidRedactionEvent(redactionEvent)).toEqual(true);
  });

  it('should fail for non redaction events', () => {
    const otherEvent = {
      type: 'm.room.power_levels',
    } as Partial<RedactionRoomEvent> as RedactionRoomEvent;

    expect(isValidRedactionEvent(otherEvent)).toEqual(false);
  });
});

describe('redactEvent', () => {
  it('should send a redaction event', async () => {
    const widgetApi = {
      sendRoomEvent: jest.fn(),
    } as Partial<jest.Mocked<WidgetApi>> as jest.Mocked<WidgetApi>;

    widgetApi.sendRoomEvent.mockResolvedValue({
      content: {},
      redacts: 'event-1234',
      origin_server_ts: 10,
      room_id: 'room-id',
      type: 'm.room.redaction',
      event_id: 'event-id',
      sender: 'sender-id',
    } as RoomEvent);

    const result = await redactEvent(widgetApi, 'event-1234');

    expect(result).toEqual({
      content: {},
      redacts: 'event-1234',
      origin_server_ts: 10,
      room_id: 'room-id',
      type: 'm.room.redaction',
      event_id: 'event-id',
      sender: 'sender-id',
    });
    expect(widgetApi.sendRoomEvent).toBeCalledWith('m.room.redaction', {
      redacts: 'event-1234',
    });
  });
});

describe('observeRedactionEvents', () => {
  it('should observe redaction events', async () => {
    const widgetApi = {
      observeRoomEvents: jest.fn(),
    } as Partial<jest.Mocked<WidgetApi>> as jest.Mocked<WidgetApi>;

    widgetApi.observeRoomEvents.mockReturnValue(
      from([
        {
          content: {},
          redacts: 'event-1234',
          origin_server_ts: 10,
          room_id: 'room-id',
          type: 'm.room.redaction',
          event_id: 'event-id',
          sender: 'sender-id',
        } as RoomEvent,
      ])
    );

    const result = await lastValueFrom(observeRedactionEvents(widgetApi));

    expect(result).toEqual({
      content: {},
      redacts: 'event-1234',
      origin_server_ts: 10,
      room_id: 'room-id',
      type: 'm.room.redaction',
      event_id: 'event-id',
      sender: 'sender-id',
    });
    expect(widgetApi.observeRoomEvents).toBeCalledWith('m.room.redaction');
  });
});

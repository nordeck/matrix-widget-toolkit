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

import { redactEvent } from '@matrix-widget-toolkit/api';
import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createStore } from '../store';
import { roomMessagesApi } from './roomMessagesApi';
import {
  mockMessageCollectionEvent,
  mockReactionEvent,
  mockRoomMessageEvent,
} from './testUtils';

let widgetApi: MockedWidgetApi;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();
});

describe('getRelevantEvents', () => {
  it('should return the relevant events', async () => {
    widgetApi.mockSendStateEvent(
      mockMessageCollectionEvent({
        content: {
          eventIds: ['$event-0', '$event-1'],
        },
      }),
    );

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(roomMessagesApi.endpoints.getRelevantEvents.initiate())
        .unwrap(),
    ).resolves.toEqual(['$event-0', '$event-1']);
  });

  it('should ignore invalid state key', async () => {
    widgetApi.mockSendStateEvent(
      mockMessageCollectionEvent({
        state_key: 'other',
        content: {
          eventIds: ['$event-0', '$event-1'],
        },
      }),
    );

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(roomMessagesApi.endpoints.getRelevantEvents.initiate())
        .unwrap(),
    ).resolves.toEqual([]);
  });

  it('should handle missing event', async () => {
    widgetApi.clearStateEvents();

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(roomMessagesApi.endpoints.getRelevantEvents.initiate())
        .unwrap(),
    ).resolves.toEqual([]);
  });

  it('should return error if read fails', async () => {
    widgetApi.receiveSingleStateEvent.mockRejectedValue(
      new Error('Unexpected error'),
    );

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(roomMessagesApi.endpoints.getRelevantEvents.initiate())
        .unwrap(),
    ).rejects.toEqual({
      name: 'LoadFailed',
      message: 'Could not load events: Unexpected error',
    });
  });

  it('should observe the message event', async () => {
    const store = createStore({ widgetApi });

    // open the subscription
    store.dispatch(roomMessagesApi.endpoints.getRelevantEvents.initiate());

    // wait for the initial load
    await waitFor(() =>
      expect(
        roomMessagesApi.endpoints.getRelevantEvents.select()(store.getState())
          .data,
      ).toEqual([]),
    );

    widgetApi.mockSendStateEvent(
      mockMessageCollectionEvent({ content: { eventIds: ['$event-id'] } }),
    );

    // wait for the change
    await waitFor(() =>
      expect(
        roomMessagesApi.endpoints.getRelevantEvents.select()(store.getState())
          .data,
      ).toEqual(['$event-id']),
    );
  });
});

describe('getMessage', () => {
  it('should return the message event and all related events', async () => {
    const messageEvent = widgetApi.mockSendRoomEvent(mockRoomMessageEvent());
    const reactionEvent = widgetApi.mockSendRoomEvent(mockReactionEvent());
    widgetApi.mockSendRoomEvent(
      mockReactionEvent({
        'm.relates_to': { event_id: '$another-id', key: 'O' },
      }),
    );

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.getMessage.initiate({
            eventId: messageEvent.event_id,
          }),
        )
        .unwrap(),
    ).resolves.toEqual({
      event: messageEvent,
      reactions: [reactionEvent],
    });
  });

  it('should return error if read fails', async () => {
    widgetApi.readEventRelations.mockRejectedValue(
      new Error('Unexpected error'),
    );

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.getMessage.initiate({
            eventId: '$event-id',
          }),
        )
        .unwrap(),
    ).rejects.toEqual({
      name: 'LoadFailed',
      message: 'Could not load events: Unexpected error',
    });
  });

  it('should observe the reaction events', async () => {
    const messageEvent = widgetApi.mockSendRoomEvent(mockRoomMessageEvent());
    const reactionEvent0 = widgetApi.mockSendRoomEvent(mockReactionEvent());

    const store = createStore({ widgetApi });

    // open the subscription
    store.dispatch(
      roomMessagesApi.endpoints.getMessage.initiate({
        eventId: messageEvent.event_id,
      }),
    );

    // wait for the initial load
    await waitFor(() =>
      expect(
        roomMessagesApi.endpoints.getMessage.select({
          eventId: messageEvent.event_id,
        })(store.getState()).data,
      ).toEqual({
        event: messageEvent,
        reactions: [reactionEvent0],
      }),
    );

    const reactionEvent1 = widgetApi.mockSendRoomEvent(
      mockReactionEvent({ event_id: '$event-id-1' }),
    );

    // wait for the change
    await waitFor(() =>
      expect(
        roomMessagesApi.endpoints.getMessage.select({
          eventId: messageEvent.event_id,
        })(store.getState()).data,
      ).toEqual({
        event: messageEvent,
        reactions: [reactionEvent0, reactionEvent1],
      }),
    );

    await redactEvent(widgetApi, reactionEvent0.event_id);

    // wait for removal initial load
    await waitFor(() =>
      expect(
        roomMessagesApi.endpoints.getMessage.select({
          eventId: messageEvent.event_id,
        })(store.getState()).data,
      ).toEqual({
        event: messageEvent,
        reactions: [reactionEvent1],
      }),
    );
  });
});

describe('sendMessage', () => {
  it('should send message to the room and update the message collection', async () => {
    widgetApi.mockSendStateEvent(
      mockMessageCollectionEvent({ content: { eventIds: ['$event-id-0'] } }),
    );

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.sendMessage.initiate({
            message: 'My message',
          }),
        )
        .unwrap(),
    ).resolves.toEqual({});

    expect(widgetApi.sendRoomEvent).toHaveBeenCalledWith('m.room.message', {
      msgtype: 'm.text',
      body: 'My message',
    });

    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      'net.nordeck.message_collection',
      { eventIds: ['$event-id-0', expect.stringMatching(/\$event-[\d]+/)] },
    );
  });

  it('should create a new message collection', async () => {
    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.sendMessage.initiate({
            message: 'My message',
          }),
        )
        .unwrap(),
    ).resolves.toEqual({});

    expect(widgetApi.sendRoomEvent).toHaveBeenCalledWith('m.room.message', {
      msgtype: 'm.text',
      body: 'My message',
    });

    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      'net.nordeck.message_collection',
      { eventIds: [expect.stringMatching(/\$event-[\d]+/)] },
    );
  });

  it('should handle send error', async () => {
    widgetApi.sendRoomEvent.mockRejectedValue(new Error('Unexpected error'));

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.sendMessage.initiate({
            message: 'My message',
          }),
        )
        .unwrap(),
    ).rejects.toEqual({
      name: 'SendFailed',
      message: 'Could not send message: Unexpected error',
    });
  });
});

describe('sendReaction', () => {
  it('should react to a message', async () => {
    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.sendReaction.initiate({
            eventId: '$event-id',
            reaction: 'X',
          }),
        )
        .unwrap(),
    ).resolves.toEqual({});

    expect(widgetApi.sendRoomEvent).toHaveBeenCalledWith('m.reaction', {
      'm.relates_to': {
        rel_type: 'm.annotation',
        event_id: '$event-id',
        key: 'X',
      },
    });
  });

  it('should handle send error', async () => {
    widgetApi.sendRoomEvent.mockRejectedValue(new Error('Unexpected error'));

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.sendReaction.initiate({
            eventId: '$event-id',
            reaction: 'X',
          }),
        )
        .unwrap(),
    ).rejects.toEqual({
      name: 'SendFailed',
      message: 'Could not send annotation: Unexpected error',
    });
  });
});

describe('sendRedaction', () => {
  it('should react to a message', async () => {
    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.sendRedaction.initiate({
            eventId: '$event-id',
          }),
        )
        .unwrap(),
    ).resolves.toEqual({});

    expect(widgetApi.sendRoomEvent).toHaveBeenCalledWith('m.room.redaction', {
      redacts: '$event-id',
    });
  });

  it('should handle send error', async () => {
    widgetApi.sendRoomEvent.mockRejectedValue(new Error('Unexpected error'));

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.sendRedaction.initiate({
            eventId: '$event-id',
          }),
        )
        .unwrap(),
    ).rejects.toEqual({
      name: 'SendFailed',
      message: 'Could not redact event: Unexpected error',
    });
  });
});

describe('dropMessageFromCollection', () => {
  it('should drop message event from an existing collection', async () => {
    widgetApi.mockSendStateEvent(mockMessageCollectionEvent());

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.dropMessageFromCollection.initiate({
            eventId: '$message-event-id',
          }),
        )
        .unwrap(),
    ).resolves.toEqual({});

    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      'net.nordeck.message_collection',
      { eventIds: [] },
    );
  });

  it('should skip updating message if event is not part of the collection', async () => {
    widgetApi.mockSendStateEvent(mockMessageCollectionEvent());

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.dropMessageFromCollection.initiate({
            eventId: '$another-event-id',
          }),
        )
        .unwrap(),
    ).resolves.toEqual({});

    expect(widgetApi.sendStateEvent).not.toHaveBeenCalled();
  });

  it('should handle send error', async () => {
    widgetApi.receiveSingleStateEvent.mockRejectedValue(
      new Error('Unexpected error'),
    );

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(
          roomMessagesApi.endpoints.dropMessageFromCollection.initiate({
            eventId: '$event-id',
          }),
        )
        .unwrap(),
    ).rejects.toEqual({
      name: 'SendFailed',
      message: 'Could not update the collection: Unexpected error',
    });
  });
});

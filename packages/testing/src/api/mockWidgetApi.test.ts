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

import { redactEvent, StateEvent } from '@matrix-widget-toolkit/api';
import { Symbols } from 'matrix-widget-api';
import { bufferTime, firstValueFrom, Observable, take } from 'rxjs';
import { MockedWidgetApi, mockWidgetApi } from './mockWidgetApi';

let widgetApi: MockedWidgetApi;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  widgetApi.mockSendRoomEvent({
    type: 'com.example.test1',
    content: {
      id: 1,
    },
    sender: '@user-id',
    event_id: 'event-1',
    room_id: '!room-id',
    origin_server_ts: 1,
  });
  widgetApi.mockSendRoomEvent({
    type: 'com.example.test2',
    content: {
      id: 3,
    },
    sender: '@user-id',
    event_id: 'event-3',
    room_id: '!other-room-id',
    origin_server_ts: 3,
  });
  widgetApi.mockSendRoomEvent({
    type: 'com.example.test2',
    content: {
      id: 2,
    },
    sender: '@user-id',
    event_id: 'event-2',
    room_id: '!room-id',
    origin_server_ts: 2,
  });

  widgetApi.mockSendStateEvent({
    type: 'com.example.test4',
    state_key: '',
    content: {
      id: 1,
    },
    sender: '@user-id',
    event_id: 'event-1',
    room_id: '!room-id',
    origin_server_ts: 1,
  });
  widgetApi.mockSendStateEvent({
    type: 'com.example.test4',
    state_key: 'other',
    content: {
      id: 2,
    },
    sender: '@user-id',
    event_id: 'event-2',
    room_id: '!room-id',
    origin_server_ts: 2,
  });
  widgetApi.mockSendStateEvent({
    type: 'com.example.test5',
    state_key: '',
    content: {
      id: 3,
    },
    sender: '@user-id',
    event_id: 'event-3',
    room_id: '!room-id',
    origin_server_ts: 3,
  });
  widgetApi.mockSendStateEvent({
    type: 'com.example.test4',
    state_key: '',
    content: {
      id: 4,
    },
    sender: '@user-id',
    event_id: 'event-4',
    room_id: '!other-room-id',
    origin_server_ts: 4,
  });
});

describe('sendRoomEvent', () => {
  it('should send room event to current room', async () => {
    widgetApi.clearRoomEvents();

    const expectedEvent = {
      content: {
        key: 'value',
      },
      event_id: expect.any(String),
      origin_server_ts: expect.any(Number),
      room_id: '!room-id',
      sender: '@user-id',
      type: 'com.example.test3',
    };

    await expect(
      widgetApi.sendRoomEvent('com.example.test3', {
        key: 'value',
      }),
    ).resolves.toEqual(expectedEvent);
    await expect(
      widgetApi.receiveRoomEvents('com.example.test3'),
    ).resolves.toEqual([expectedEvent]);
  });

  it('should send redaction event to the current room', async () => {
    widgetApi.clearRoomEvents();

    const expectedEvent = {
      content: {},
      event_id: expect.any(String),
      origin_server_ts: expect.any(Number),
      room_id: '!room-id',
      sender: '@user-id',
      type: 'm.room.redaction',
      redacts: '$event-id',
    };

    await expect(
      widgetApi.sendRoomEvent('m.room.redaction', {
        redacts: '$event-id',
      }),
    ).resolves.toEqual(expectedEvent);
    await expect(
      widgetApi.receiveRoomEvents('m.room.redaction'),
    ).resolves.toEqual([expectedEvent]);
  });

  it('should redact an event', async () => {
    const expectedEvent = {
      content: {},
      event_id: 'event-1',
      origin_server_ts: expect.any(Number),
      room_id: '!room-id',
      sender: '@user-id',
      type: 'com.example.test1',
    };

    await redactEvent(widgetApi, 'event-1');

    await expect(
      widgetApi.receiveRoomEvents('com.example.test1'),
    ).resolves.toEqual([expectedEvent]);
  });
});

describe('receiveRoomEvents', () => {
  it('should receive only events from the current room', async () => {
    await expect(
      widgetApi.receiveRoomEvents('com.example.test2'),
    ).resolves.toEqual([expect.objectContaining({ event_id: 'event-2' })]);
  });

  it('should receive events from all rooms', async () => {
    await expect(
      widgetApi.receiveRoomEvents('com.example.test2', {
        roomIds: Symbols.AnyRoom,
      }),
    ).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-2' }),
      expect.objectContaining({ event_id: 'event-3' }),
    ]);
  });

  it('should receive events from another room', async () => {
    await expect(
      widgetApi.receiveRoomEvents('com.example.test2', {
        roomIds: ['!other-room-id'],
      }),
    ).resolves.toEqual([expect.objectContaining({ event_id: 'event-3' })]);
  });

  it('should filter by message type', async () => {
    widgetApi.mockSendRoomEvent({
      type: 'com.example.test1',
      content: {
        id: 1,
        msgtype: 'only',
      },
      sender: '@user-id',
      event_id: 'event-2',
      room_id: '!room-id',
      origin_server_ts: 1,
    });

    await expect(
      widgetApi.receiveRoomEvents('com.example.test1', {
        messageType: 'only',
      }),
    ).resolves.toEqual([expect.objectContaining({ event_id: 'event-2' })]);
  });

  it('should not receive events after clearing', async () => {
    widgetApi.clearRoomEvents();

    await expect(
      widgetApi.receiveRoomEvents('com.example.test1'),
    ).resolves.toEqual([]);
  });

  it('should not receive events after clearing a selected type', async () => {
    widgetApi.clearRoomEvents({ type: 'com.example.test1' });

    await expect(
      widgetApi.receiveRoomEvents('com.example.test1'),
    ).resolves.toEqual([]);
    await expect(
      widgetApi.receiveRoomEvents('com.example.test2'),
    ).resolves.toEqual([expect.objectContaining({ event_id: 'event-2' })]);
  });
});

describe('observeRoomEvents', () => {
  it('should receive only events from the current room', async () => {
    const observable = widgetApi
      .observeRoomEvents('com.example.test2')
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-2' }),
    ]);
  });

  it('should receive events from all rooms', async () => {
    const observable = widgetApi
      .observeRoomEvents('com.example.test2', {
        roomIds: Symbols.AnyRoom,
      })
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-2' }),
      expect.objectContaining({ event_id: 'event-3' }),
    ]);
  });

  it('should receive events from another room', async () => {
    const observable = widgetApi
      .observeRoomEvents('com.example.test2', {
        roomIds: ['!other-room-id'],
      })
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-3' }),
    ]);
  });

  it('should receive events that are added later', async () => {
    const observable = widgetApi
      .observeRoomEvents('com.example.test2')
      .pipe(bufferTime(100));
    const promise = firstValueFrom(observable);

    widgetApi.mockSendRoomEvent({
      type: 'com.example.test2',
      content: {
        id: 4,
      },
      sender: '@user-id',
      event_id: 'event-4',
      room_id: '!room-id',
      origin_server_ts: 4,
    });

    await expect(promise).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-2' }),
      expect.objectContaining({ event_id: 'event-4' }),
    ]);
  });

  it('should filter by message type', async () => {
    widgetApi.mockSendRoomEvent({
      type: 'com.example.test1',
      content: {
        id: 1,
        msgtype: 'only',
      },
      sender: '@user-id',
      event_id: 'event-2',
      room_id: '!room-id',
      origin_server_ts: 1,
    });

    const observable = widgetApi
      .observeRoomEvents('com.example.test1', {
        messageType: 'only',
      })
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-2' }),
    ]);
  });

  it('should not receive events after clearing', async () => {
    widgetApi.clearRoomEvents();
    const observable = widgetApi
      .observeRoomEvents('com.example.test2')
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([]);
  });
});

describe('sendStateEvent', () => {
  it('should send state event to current room', async () => {
    const expectedEvent: StateEvent = {
      content: {
        key: 'value',
      },
      event_id: expect.any(String),
      origin_server_ts: expect.any(Number),
      room_id: '!room-id',
      sender: '@user-id',
      state_key: '',
      type: 'com.example.test6',
    };

    await expect(
      widgetApi.sendStateEvent('com.example.test6', { key: 'value' }),
    ).resolves.toEqual(expectedEvent);
    await expect(
      widgetApi.receiveSingleStateEvent('com.example.test6'),
    ).resolves.toEqual(expectedEvent);
  });

  it('should send state event and override existing state', async () => {
    const expectedEvent: StateEvent = {
      content: {
        key: 'new',
      },
      event_id: expect.any(String),
      origin_server_ts: expect.any(Number),
      room_id: '!room-id',
      sender: '@user-id',
      state_key: '',
      type: 'com.example.test6',
    };

    await widgetApi.sendStateEvent('com.example.test6', { key: 'value' });
    await expect(
      widgetApi.sendStateEvent('com.example.test6', { key: 'new' }),
    ).resolves.toEqual(expectedEvent);
    await expect(
      widgetApi.receiveSingleStateEvent('com.example.test6'),
    ).resolves.toEqual(expectedEvent);
    await expect(
      widgetApi.receiveStateEvents('com.example.test6'),
    ).resolves.toEqual([expectedEvent]);
  });

  it('should not resolve promise if event content is unchanged', async () => {
    await widgetApi.sendStateEvent('com.example.test6', { key: 'value' });

    await expect(
      Promise.race([
        widgetApi.sendStateEvent('com.example.test6', { key: 'value' }),
        // Timeout after a short moment
        new Promise((resolve, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100),
        ),
      ]),
    ).rejects.toThrowError('Timeout');
  });
});

describe('receiveSingleStateEvent', () => {
  it('should receive event from the current room with a default state key', async () => {
    await expect(
      widgetApi.receiveSingleStateEvent('com.example.test4'),
    ).resolves.toEqual(expect.objectContaining({ event_id: 'event-1' }));
  });

  it('should receive event with a specific state key', async () => {
    await expect(
      widgetApi.receiveSingleStateEvent('com.example.test4', 'other'),
    ).resolves.toEqual(expect.objectContaining({ event_id: 'event-2' }));
  });

  it('should not receive events after clearing', async () => {
    widgetApi.clearStateEvents();

    await expect(
      widgetApi.receiveSingleStateEvent('com.example.test4'),
    ).resolves.toBeUndefined();
  });

  it('should not receive events after clearing a selected type', async () => {
    widgetApi.clearStateEvents({ type: 'com.example.test4' });

    await expect(
      widgetApi.receiveSingleStateEvent('com.example.test4'),
    ).resolves.toBeUndefined();
    await expect(
      widgetApi.receiveSingleStateEvent('com.example.test5'),
    ).resolves.toEqual(expect.objectContaining({ event_id: 'event-3' }));
  });
});

describe('receiveStateEvents', () => {
  it('should receive only events from the current room', async () => {
    await expect(
      widgetApi.receiveStateEvents('com.example.test4'),
    ).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-1' }),
      expect.objectContaining({ event_id: 'event-2' }),
    ]);
  });

  it('should receive events from all rooms', async () => {
    await expect(
      widgetApi.receiveStateEvents('com.example.test4', {
        roomIds: Symbols.AnyRoom,
      }),
    ).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-1' }),
      expect.objectContaining({ event_id: 'event-2' }),
      expect.objectContaining({ event_id: 'event-4' }),
    ]);
  });

  it('should receive events from another room', async () => {
    await expect(
      widgetApi.receiveStateEvents('com.example.test4', {
        roomIds: ['!other-room-id'],
      }),
    ).resolves.toEqual([expect.objectContaining({ event_id: 'event-4' })]);
  });

  it('should receive events with a specific state key', async () => {
    await expect(
      widgetApi.receiveStateEvents('com.example.test4', { stateKey: '' }),
    ).resolves.toEqual([expect.objectContaining({ event_id: 'event-1' })]);
  });

  it('should receive only distinct events per state key', async () => {
    widgetApi.mockSendStateEvent({
      type: 'com.example.test4',
      state_key: '',
      content: {
        id: 5,
      },
      sender: '@user-id',
      event_id: 'event-5',
      room_id: '!room-id',
      origin_server_ts: 5,
    });

    await expect(
      widgetApi.receiveStateEvents('com.example.test4', { stateKey: '' }),
    ).resolves.toEqual([expect.objectContaining({ event_id: 'event-5' })]);
  });

  it('should not receive events after clearing', async () => {
    widgetApi.clearStateEvents();

    await expect(
      widgetApi.receiveStateEvents('com.example.test4'),
    ).resolves.toEqual([]);
  });

  it('should not receive events after clearing a selected type', async () => {
    widgetApi.clearStateEvents({ type: 'com.example.test4' });

    await expect(
      widgetApi.receiveStateEvents('com.example.test4'),
    ).resolves.toEqual([]);
    await expect(
      widgetApi.receiveStateEvents('com.example.test5'),
    ).resolves.toEqual([expect.objectContaining({ event_id: 'event-3' })]);
  });
});

describe('observeStateEvents', () => {
  it('should receive only events from the current room', async () => {
    const observable = widgetApi
      .observeStateEvents('com.example.test4')
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-1' }),
      expect.objectContaining({ event_id: 'event-2' }),
    ]);
  });

  it('should receive events from all rooms', async () => {
    const observable = widgetApi
      .observeStateEvents('com.example.test4', { roomIds: Symbols.AnyRoom })
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-1' }),
      expect.objectContaining({ event_id: 'event-2' }),
      expect.objectContaining({ event_id: 'event-4' }),
    ]);
  });

  it('should receive events from another room', async () => {
    const observable = widgetApi
      .observeStateEvents('com.example.test4', { roomIds: ['!other-room-id'] })
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-4' }),
    ]);
  });

  it('should receive events with a specific state key', async () => {
    const observable = widgetApi
      .observeStateEvents('com.example.test4', { stateKey: '' })
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-1' }),
    ]);
  });

  it('should receive only distinct events per state key', async () => {
    widgetApi.mockSendStateEvent({
      type: 'com.example.test4',
      state_key: '',
      content: {
        id: 5,
      },
      sender: '@user-id',
      event_id: 'event-5',
      room_id: '!room-id',
      origin_server_ts: 5,
    });

    const observable = widgetApi
      .observeStateEvents('com.example.test4', { stateKey: '' })
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-5' }),
    ]);
  });

  it('should receive events that are added later', async () => {
    const observable = widgetApi
      .observeStateEvents('com.example.test4')
      .pipe(bufferTime(100));
    const promise = firstValueFrom(observable);

    widgetApi.mockSendStateEvent({
      type: 'com.example.test4',
      state_key: '',
      content: {
        id: 5,
      },
      sender: '@user-id',
      event_id: 'event-5',
      room_id: '!room-id',
      origin_server_ts: 5,
    });

    await expect(promise).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-1' }),
      expect.objectContaining({ event_id: 'event-2' }),
      expect.objectContaining({ event_id: 'event-5' }),
    ]);
  });

  it('should not receive events after clearing', async () => {
    widgetApi.clearStateEvents();
    const observable = widgetApi
      .observeStateEvents('com.example.test4')
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable)).resolves.toEqual([]);
  });

  it('should not receive events after clearing a selected type', async () => {
    widgetApi.clearStateEvents({ type: 'com.example.test4' });
    const observable4 = widgetApi
      .observeStateEvents('com.example.test4')
      .pipe(bufferTime(100));
    const observable5 = widgetApi
      .observeStateEvents('com.example.test5')
      .pipe(bufferTime(100));

    await expect(firstValueFrom(observable4)).resolves.toEqual([]);
    await expect(firstValueFrom(observable5)).resolves.toEqual([
      expect.objectContaining({ event_id: 'event-3' }),
    ]);
  });
});

describe('openModal', () => {
  it('should resolve', async () => {
    await expect(widgetApi.openModal('/path', 'name')).resolves.toBeUndefined();
  });
});

describe('closeModal', () => {
  it('should resolve', async () => {
    await expect(widgetApi.closeModal()).resolves.toBeUndefined();
  });
});

describe('getWidgetConfig', () => {
  it('should return undefined', () => {
    expect(widgetApi.getWidgetConfig()).toBeUndefined();
  });
});

describe('hasInitialCapabilities', () => {
  it('should return true', () => {
    expect(widgetApi.hasInitialCapabilities()).toBe(true);
  });
});

describe('hasCapabilities', () => {
  it('should return true', () => {
    expect(widgetApi.hasCapabilities(['my.capability'])).toBe(true);
  });
});

describe('navigateTo', () => {
  it('should resolve', async () => {
    await expect(widgetApi.navigateTo('url')).resolves.toBeUndefined();
  });
});

describe('observeModalButtons', () => {
  it('should return observable', () => {
    expect(widgetApi.observeModalButtons()).toEqual(expect.any(Observable));
  });
});

describe('rerequestInitialCapabilities', () => {
  it('should resolve', async () => {
    await expect(
      widgetApi.rerequestInitialCapabilities(),
    ).resolves.toBeUndefined();
  });
});

describe('requestCapabilities', () => {
  it('should resolve', async () => {
    await expect(
      widgetApi.requestCapabilities(['my.capability']),
    ).resolves.toBeUndefined();
  });
});

describe('requestOpenIDConnectToken', () => {
  it('should resolve', async () => {
    await expect(widgetApi.requestOpenIDConnectToken()).resolves.toEqual({});
  });
});

describe('setModalButtonEnabled', () => {
  it('should resolve', async () => {
    await expect(
      widgetApi.setModalButtonEnabled('button', false),
    ).resolves.toBeUndefined();
  });
});

describe('readEventRelations', () => {
  beforeEach(() => {
    widgetApi.clearRoomEvents();
    widgetApi.clearStateEvents();

    widgetApi.mockSendRoomEvent({
      type: 'com.example.test1',
      content: {
        id: 1,
      },
      sender: '@user-id',
      event_id: 'event-1',
      room_id: '!room-id',
      origin_server_ts: 1,
    });
    widgetApi.mockSendRoomEvent({
      type: 'com.example.test2',
      content: {
        id: 2,
        'm.relates_to': {
          rel_type: 'm.reference',
          event_id: 'event-1',
        },
      },
      sender: '@user-id',
      event_id: 'event-2',
      room_id: '!room-id',
      origin_server_ts: 3,
    });
    widgetApi.mockSendRoomEvent({
      type: 'com.example.test3',
      content: {
        id: 3,
        'm.relates_to': {
          rel_type: 'm.replace',
          event_id: 'event-1',
        },
      },
      sender: '@user-id',
      event_id: 'event-3',
      room_id: '!room-id',
      origin_server_ts: 2,
    });
    widgetApi.mockSendRoomEvent({
      type: 'com.example.test4',
      content: {
        id: 4,
        'm.relates_to': {
          rel_type: 'm.replace',
          event_id: 'event-1',
        },
      },
      sender: '@user-id',
      event_id: 'event-4',
      room_id: '!other-room-id',
      origin_server_ts: 2,
    });
    widgetApi.mockSendRoomEvent({
      type: 'com.example.test5',
      content: {
        id: 5,
      },
      sender: '@user-id',
      event_id: 'event-1',
      room_id: '!other-room-id',
      origin_server_ts: 1,
    });
  });

  it('should receive only events from the current room', async () => {
    await expect(widgetApi.readEventRelations('event-1')).resolves.toEqual({
      chunk: [
        expect.objectContaining({ event_id: 'event-2' }),
        expect.objectContaining({ event_id: 'event-3' }),
      ],
      nextToken: undefined,
    });
  });

  it('should receive events from another room', async () => {
    await expect(
      widgetApi.readEventRelations('event-1', { roomId: '!other-room-id' }),
    ).resolves.toEqual({
      chunk: [expect.objectContaining({ event_id: 'event-4' })],
      nextToken: undefined,
    });
  });

  it('should only receive events of a specific relation type', async () => {
    await expect(
      widgetApi.readEventRelations('event-1', { relationType: 'm.replace' }),
    ).resolves.toEqual({
      chunk: [expect.objectContaining({ event_id: 'event-3' })],
      nextToken: undefined,
    });
  });

  it('should only receive events of a specific event type', async () => {
    await expect(
      widgetApi.readEventRelations('event-1', {
        eventType: 'com.example.test2',
      }),
    ).resolves.toEqual({
      chunk: [expect.objectContaining({ event_id: 'event-2' })],
      nextToken: undefined,
    });
  });

  it('should paginate the related events forwards', async () => {
    await expect(
      widgetApi.readEventRelations('event-1', {
        limit: 1,
        direction: 'f',
      }),
    ).resolves.toEqual({
      chunk: [expect.objectContaining({ event_id: 'event-3' })],
      nextToken: '1',
    });

    await expect(
      widgetApi.readEventRelations('event-1', {
        limit: 1,
        from: '1',
        direction: 'f',
      }),
    ).resolves.toEqual({
      chunk: [expect.objectContaining({ event_id: 'event-2' })],
      nextToken: undefined,
    });
  });

  it('should reject if the referenced event does not exist', async () => {
    await expect(
      widgetApi.readEventRelations('not-existent-event'),
    ).rejects.toThrow('Unexpected error while reading relations');
  });
});

describe('sendToDeviceMessage', () => {
  it('should send to device message to all devices of the current user', async () => {
    const messagePromise = firstValueFrom(
      widgetApi.observeToDeviceMessages('com.example.message'),
    );

    await widgetApi.sendToDeviceMessage('com.example.message', true, {
      '@user-id': {
        '*': { my: 'content' },
      },
    });

    await expect(messagePromise).resolves.toEqual({
      content: { my: 'content' },
      encrypted: true,
      sender: '@user-id',
      type: 'com.example.message',
    });
  });

  it('should send to device message to a specific device of the current user', async () => {
    const messagePromise = firstValueFrom(
      widgetApi.observeToDeviceMessages('com.example.message'),
    );

    await widgetApi.sendToDeviceMessage('com.example.message', false, {
      '@user-id': {
        'device-id': { my: 'content' },
      },
    });

    await expect(messagePromise).resolves.toEqual({
      content: {
        my: 'content',
      },
      encrypted: false,
      sender: '@user-id',
      type: 'com.example.message',
    });
  });

  it('should send to device message to another user', async () => {
    const messagesPromise = firstValueFrom(
      widgetApi
        .observeToDeviceMessages('com.example.message')
        .pipe(bufferTime(100)),
    );

    await widgetApi.sendToDeviceMessage('com.example.message', false, {
      '@other-user-id': {
        '*': { other: 'content' },
      },
    });

    await expect(messagesPromise).resolves.toEqual([]);
  });

  it('should send to device message to multiple users', async () => {
    const messagesPromise = firstValueFrom(
      widgetApi
        .observeToDeviceMessages('com.example.message')
        .pipe(bufferTime(100)),
    );

    await widgetApi.sendToDeviceMessage('com.example.message', false, {
      '@other-user-id': {
        '*': { other: 'content' },
      },
      '@user-id': {
        '*': { my: 'content' },
      },
    });

    await expect(messagesPromise).resolves.toEqual([
      {
        content: { my: 'content' },
        sender: '@user-id',
        encrypted: false,
        type: 'com.example.message',
      },
    ]);
  });
});

describe('observeToDeviceMessages', () => {
  it('should receive only to device messages for the correct type', async () => {
    const messagePromise = firstValueFrom(
      widgetApi.observeToDeviceMessages('com.example.message'),
    );

    widgetApi.mockSendToDeviceMessage({
      content: { other: 'content' },
      encrypted: false,
      sender: '@user-id',
      type: 'com.example.other',
    });

    widgetApi.mockSendToDeviceMessage({
      content: { my: 'content' },
      encrypted: false,
      sender: '@user-id',
      type: 'com.example.message',
    });

    await expect(messagePromise).resolves.toEqual({
      content: { my: 'content' },
      encrypted: false,
      sender: '@user-id',
      type: 'com.example.message',
    });
  });
});

describe('observeTurnServers', () => {
  it('should return mocked turn servers', async () => {
    const turnServer = await firstValueFrom(
      widgetApi.observeTurnServers().pipe(take(1)),
    );

    expect(turnServer).toEqual({
      urls: ['turn:turn.matrix.org'],
      username: 'user',
      credential: 'credential',
    });
  });
});

describe('searchUserDirectory', () => {
  it('should return empty response', async () => {
    await expect(widgetApi.searchUserDirectory('search')).resolves.toEqual({
      results: [],
    });
  });
});

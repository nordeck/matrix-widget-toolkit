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
  EventDirection,
  IOpenIDCredentials,
  IRoomEvent,
  ITransport,
  WidgetApi as MatrixWidgetApi,
  Symbols,
  WidgetApiToWidgetAction,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { ReplaySubject, firstValueFrom, take, toArray } from 'rxjs';
import { WidgetApiImpl } from './WidgetApiImpl';
import { parseWidgetId as parseWidgetIdMocked } from './parameters';
import { ToDeviceMessageEvent } from './types';

jest.mock('./parameters', () => ({
  ...jest.requireActual('./parameters'),
  parseWidgetId: jest.fn(),
}));

const parseWidgetId = jest.mocked(parseWidgetIdMocked);

describe('WidgetApiImpl', () => {
  type MockedMatrixWidgetApi = jest.Mocked<MatrixWidgetApi> & {
    transport: jest.Mocked<ITransport>;
  };
  let matrixWidgetApi: MockedMatrixWidgetApi;
  let widgetApi: WidgetApiImpl;

  beforeEach(() => {
    matrixWidgetApi = {
      start: jest.fn(),
      requestCapabilities: jest.fn(),
      hasCapability: jest.fn(),
      updateRequestedCapabilities: jest.fn(),
      sendRoomEvent: jest.fn(),
      sendStateEvent: jest.fn(),
      readStateEvents: jest.fn(),
      readRoomEvents: jest.fn(),
      sendToDevice: jest.fn(),
      openModalWidget: jest.fn(),
      setModalButtonEnabled: jest.fn(),
      closeModalWidget: jest.fn(),
      navigateTo: jest.fn(),
      requestOpenIDConnectToken: jest.fn(),
      getTurnServers: jest.fn(),
      readEventRelations: jest.fn(),
      searchUserDirectory: jest.fn(),
      getMediaConfig: jest.fn(),
      uploadFile: jest.fn(),
      transport: {
        reply: jest.fn(),
      },
      // Event listener
      once: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    } as
      | Partial<MatrixWidgetApi>
      | {
          transport: Partial<ITransport>;
        } as MockedMatrixWidgetApi;
    widgetApi = new WidgetApiImpl(
      matrixWidgetApi,
      'widget-id',
      {
        isOpenedByClient: true,
        userId: '@my-user-id',
        roomId: '!current-room',
      },
      {
        capabilities: [
          'my.capability',
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            'm.room.name',
          ),
        ],
      },
    );
    parseWidgetId.mockReturnValue({
      isModal: false,
      mainWidgetId: '',
    });
  });

  describe('initialize', () => {
    it('should wait till initial capabilities negotiation with host is completed', async () => {
      matrixWidgetApi.once.mockImplementationOnce((_, listener) => {
        listener();
        return matrixWidgetApi;
      });

      await expect(widgetApi.initialize()).resolves.toBeUndefined();
      expect(matrixWidgetApi.start).toHaveBeenCalled();
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
        'org.matrix.msc2762.receive.state_event:m.room.name',
        'io.element.requires_client',
      ]);
      expect(matrixWidgetApi.once).toHaveBeenCalledWith(
        'ready',
        expect.any(Function),
      );
    });

    it('should remove capability for standalone support', async () => {
      matrixWidgetApi.once.mockImplementationOnce((_, listener) => {
        listener();
        return matrixWidgetApi;
      });
      widgetApi = new WidgetApiImpl(
        matrixWidgetApi,
        'widget-id',
        {
          isOpenedByClient: true,
          userId: '@my-user-id',
          roomId: '!current-room',
        },
        {
          capabilities: [
            'my.capability',
            WidgetEventCapability.forStateEvent(
              EventDirection.Receive,
              'm.room.name',
            ),
          ],
          supportStandalone: true,
        },
      );

      await expect(widgetApi.initialize()).resolves.toBeUndefined();
      expect(matrixWidgetApi.start).toHaveBeenCalled();
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
        'org.matrix.msc2762.receive.state_event:m.room.name',
      ]);
      expect(matrixWidgetApi.once).toHaveBeenCalledWith(
        'ready',
        expect.any(Function),
      );
    });

    it('should wait till widget config is received for modal widgets', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: true,
        mainWidgetId: '',
      });

      const preventDefault = jest.fn();

      matrixWidgetApi.once.mockImplementationOnce((_, listener) => {
        listener();
        return matrixWidgetApi;
      });
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: {
            data: {
              name: 'Widget Title',
              data: {
                hello: 'world',
              },
            },
          },
          preventDefault,
        });
        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(widgetApi.initialize()).resolves.toBeUndefined();
      expect(matrixWidgetApi.start).toHaveBeenCalled();
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
        'org.matrix.msc2762.receive.state_event:m.room.name',
        'io.element.requires_client',
      ]);
      expect(matrixWidgetApi.once).toHaveBeenCalledWith(
        'ready',
        expect.any(Function),
      );
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.WidgetConfig}`,
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.WidgetConfig}`,
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalled();
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();

      expect(widgetApi.getWidgetConfig()).toEqual({
        name: 'Widget Title',
        data: {
          hello: 'world',
        },
      });
    });

    it('should fail if widget config can not be received due to an error', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: true,
        mainWidgetId: '',
      });

      const preventDefault = jest.fn();

      matrixWidgetApi.transport.reply.mockImplementation(() => {
        throw new Error('Transport Error');
      });
      matrixWidgetApi.once.mockImplementationOnce((eventName, listener) => {
        listener();
        return matrixWidgetApi;
      });
      matrixWidgetApi.on.mockImplementationOnce((eventName, listener) => {
        listener({
          detail: {
            data: {
              name: 'Widget Title',
              data: {
                hello: 'world',
              },
            },
          },
          preventDefault,
        });
        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(() => widgetApi.initialize()).rejects.toThrow(
        'Transport Error',
      );
      expect(matrixWidgetApi.start).toHaveBeenCalled();
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalled();
      expect(matrixWidgetApi.once).toHaveBeenCalledWith(
        'ready',
        expect.any(Function),
      );
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.WidgetConfig}`,
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.WidgetConfig}`,
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalled();
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();
    });
  });

  describe('getWidgetConfig', () => {
    it('should return undefined for widget config if not in modal', async () => {
      expect(widgetApi.getWidgetConfig()).toBeUndefined();
    });
  });

  describe('rerequestInitialCapabilities', () => {
    it('should re-request initial capabilities', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(false);
      matrixWidgetApi.on.mockImplementation((eventName, listener) => {
        listener({
          detail: {
            data: {
              approved: [
                'my.capability',
                'org.matrix.msc2762.receive.state_event:m.room.name',
                'io.element.requires_client',
              ],
              requested: [
                'my.capability',
                'org.matrix.msc2762.receive.state_event:m.room.name',
                'io.element.requires_client',
              ],
            },
          },
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.rerequestInitialCapabilities(),
      ).resolves.toBeUndefined();

      expect(matrixWidgetApi.hasCapability).toHaveBeenCalled();
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
        'org.matrix.msc2762.receive.state_event:m.room.name',
        'io.element.requires_client',
      ]);
      expect(matrixWidgetApi.updateRequestedCapabilities).toHaveBeenCalled();
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
    });
  });

  describe('hasInitialCapabilities', () => {
    it('should succeed if all initial capabilities are granted', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(true);

      expect(widgetApi.hasInitialCapabilities()).toEqual(true);

      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'my.capability',
      );
      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'org.matrix.msc2762.receive.state_event:m.room.name',
      );
      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'io.element.requires_client',
      );
    });

    it('should fail if any initial capability is not granted', async () => {
      matrixWidgetApi.hasCapability.mockReturnValueOnce(true);
      matrixWidgetApi.hasCapability.mockReturnValueOnce(false);

      expect(widgetApi.hasInitialCapabilities()).toEqual(false);
      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'my.capability',
      );
      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'org.matrix.msc2762.receive.state_event:m.room.name',
      );
    });
  });

  describe('requestCapabilities', () => {
    it('should request capabilities', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(false);
      matrixWidgetApi.on.mockImplementation((eventName, listener) => {
        listener({
          detail: {
            data: {
              approved: [
                'my.capability',
                'org.matrix.msc2762.receive.state_event:m.room.name',
              ],
              requested: [
                'my.capability',
                'org.matrix.msc2762.receive.state_event:m.room.name',
              ],
            },
          },
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.requestCapabilities([
          'my.capability',
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            'm.room.name',
          ),
        ]),
      ).resolves.toBeUndefined();

      expect(matrixWidgetApi.hasCapability).toHaveBeenCalled();
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
        'org.matrix.msc2762.receive.state_event:m.room.name',
      ]);
      expect(matrixWidgetApi.updateRequestedCapabilities).toHaveBeenCalled();
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
    });

    it('should skip capabilities request if all of them are already granted', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(true);

      await expect(
        widgetApi.requestCapabilities([
          'my.capability',
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            'm.room.name',
          ),
        ]),
      ).resolves.toBeUndefined();

      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'my.capability',
      );
      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'org.matrix.msc2762.receive.state_event:m.room.name',
      );
      expect(matrixWidgetApi.requestCapabilities).not.toHaveBeenCalled();
      expect(
        matrixWidgetApi.updateRequestedCapabilities,
      ).not.toHaveBeenCalled();
    });

    it('should fail capabilities request if one of them is denied', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(false);
      matrixWidgetApi.on.mockImplementation((_, listener) => {
        listener({
          detail: {
            data: {
              approved: ['my.capability'],
              requested: [
                'my.capability',
                'org.matrix.msc2762.receive.state_event:m.room.name',
              ],
            },
          },
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.requestCapabilities([
          'my.capability',
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            'm.room.name',
          ),
        ]),
      ).rejects.toThrow(
        'Capabilities rejected: org.matrix.msc2762.receive.state_event:m.room.name',
      );

      expect(matrixWidgetApi.hasCapability).toHaveBeenCalled();
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
        'org.matrix.msc2762.receive.state_event:m.room.name',
      ]);
      expect(matrixWidgetApi.updateRequestedCapabilities).toHaveBeenCalled();
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
    });

    test('should queue parallel capabilities requests', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(false);
      matrixWidgetApi.on.mockImplementation((_, listener) => {
        setTimeout(() => {
          listener({
            detail: {
              data: {
                approved: ['my.capability'],
                requested: ['my.capability'],
              },
            },
          });

          // Once we approved the capability, enable the hasCapability short
          // cut:
          matrixWidgetApi.hasCapability.mockReturnValue(true);
        }, 0);

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        Promise.all([
          widgetApi.requestCapabilities(['my.capability']),
          widgetApi.requestCapabilities(['my.capability']),
        ]),
      ).resolves.toEqual([undefined, undefined]);

      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'my.capability',
      );
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
      ]);
      expect(matrixWidgetApi.updateRequestedCapabilities).toHaveBeenCalledTimes(
        1,
      );
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
    });

    test('should run next queued capabilities requests, even if the previous fails', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(false);
      matrixWidgetApi.on
        .mockImplementationOnce((_, listener) => {
          setTimeout(() => {
            listener({
              detail: {
                data: {
                  approved: [],
                  requested: ['my.capability'],
                },
              },
            });
          }, 0);

          return matrixWidgetApi;
        })
        .mockImplementationOnce((_, listener) => {
          setTimeout(() => {
            listener({
              detail: {
                data: {
                  approved: ['my.capability'],
                  requested: ['my.capability'],
                },
              },
            });
          }, 0);

          return matrixWidgetApi;
        });
      matrixWidgetApi.off.mockReturnThis();

      const promiseFailure = widgetApi.requestCapabilities(['my.capability']);
      const promiseSuccess = widgetApi.requestCapabilities(['my.capability']);

      await expect(promiseFailure).rejects.toThrow(
        'Capabilities rejected: my.capability',
      );
      await expect(promiseSuccess).resolves.toBeUndefined();

      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'my.capability',
      );
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
      ]);
      expect(matrixWidgetApi.updateRequestedCapabilities).toHaveBeenCalledTimes(
        2,
      );
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
    });

    it('should fail capabilities request due to error while sending', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(false);
      matrixWidgetApi.on.mockReturnThis();
      matrixWidgetApi.off.mockReturnThis();
      matrixWidgetApi.updateRequestedCapabilities.mockRejectedValue(
        new Error('Transport Error'),
      );

      await expect(
        widgetApi.requestCapabilities(['my.capability']),
      ).rejects.toThrow('Transport Error');

      expect(matrixWidgetApi.hasCapability).toHaveBeenCalled();
      expect(matrixWidgetApi.requestCapabilities).toHaveBeenCalledWith([
        'my.capability',
      ]);
      expect(matrixWidgetApi.updateRequestedCapabilities).toHaveBeenCalled();
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        `action:${WidgetApiToWidgetAction.NotifyCapabilities}`,
        expect.any(Function),
      );
    });
  });

  describe('hasCapabilities', () => {
    it('should succeed if all capabilities are granted', async () => {
      matrixWidgetApi.hasCapability.mockReturnValue(true);

      expect(
        widgetApi.hasCapabilities([
          'my.capability',
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            'm.room.name',
          ),
        ]),
      ).toEqual(true);
    });

    it('should fail if any capability is not granted', async () => {
      matrixWidgetApi.hasCapability.mockReturnValueOnce(true);
      matrixWidgetApi.hasCapability.mockReturnValueOnce(false);

      expect(
        widgetApi.hasCapabilities([
          'my.capability',
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            'm.room.name',
          ),
        ]),
      ).toEqual(false);
      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'my.capability',
      );
      expect(matrixWidgetApi.hasCapability).toHaveBeenCalledWith(
        'org.matrix.msc2762.receive.state_event:m.room.name',
      );
    });
  });

  describe('receiveSingleStateEvent', () => {
    it('should receive state event', async () => {
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
          state_key: '',
        }),
      ]);

      await expect(
        widgetApi.receiveSingleStateEvent('com.example.test'),
      ).resolves.toMatchObject({ content: { hello: 'world' }, state_key: '' });
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        '',
        undefined,
      );
    });

    it('should receive state event with custom state key', async () => {
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
          state_key: 'custom-state-key',
        }),
      ]);

      await expect(
        widgetApi.receiveSingleStateEvent(
          'com.example.test',
          'custom-state-key',
        ),
      ).resolves.toMatchObject({
        type: 'com.example.test',
        content: { hello: 'world' },
        state_key: 'custom-state-key',
      });
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        'custom-state-key',
        undefined,
      );
    });

    it('should reject if receiving state event fails', async () => {
      matrixWidgetApi.readStateEvents.mockRejectedValue(
        new Error('Power to low'),
      );

      await expect(
        widgetApi.receiveSingleStateEvent('com.example.test'),
      ).rejects.toThrow('Power to low');
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        '',
        undefined,
      );
    });

    it("should return undefined if state event doesn't exist", async () => {
      matrixWidgetApi.readStateEvents.mockResolvedValue([]);

      await expect(
        widgetApi.receiveSingleStateEvent('com.example.test'),
      ).resolves.toBeUndefined();
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        '',
        undefined,
      );
    });
  });

  describe('receiveStateEvents', () => {
    it('should receive state events', async () => {
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({ content: { hello: 'world' }, state_key: '' }),
      ]);

      await expect(
        widgetApi.receiveStateEvents('com.example.test'),
      ).resolves.toEqual([
        expect.objectContaining({ content: { hello: 'world' }, state_key: '' }),
      ]);
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        undefined,
      );
    });

    it('should receive state event with custom state key', async () => {
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
          state_key: 'custom-state-key',
        }),
      ]);

      await expect(
        widgetApi.receiveStateEvents('com.example.test', {
          stateKey: 'custom-state-key',
        }),
      ).resolves.toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          content: { hello: 'world' },
          state_key: 'custom-state-key',
        }),
      ]);
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        'custom-state-key',
        undefined,
      );
    });

    it('should receive state event with room ids', async () => {
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
          room_id: '!custom-room',
          state_key: '',
        }),
      ]);

      await expect(
        widgetApi.receiveStateEvents('com.example.test', {
          roomIds: ['!custom-room'],
        }),
      ).resolves.toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          content: { hello: 'world' },
          state_key: '',
          room_id: '!custom-room',
        }),
      ]);
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        ['!custom-room'],
      );
    });

    it('should receive state event with wildcard room ids', async () => {
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
          state_key: '',
        }),
      ]);

      await expect(
        widgetApi.receiveStateEvents('com.example.test', {
          roomIds: Symbols.AnyRoom,
        }),
      ).resolves.toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          content: { hello: 'world' },
          state_key: '',
        }),
      ]);
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        [Symbols.AnyRoom],
      );
    });

    it('should reject if receiving state event fails', async () => {
      matrixWidgetApi.readStateEvents.mockRejectedValue(
        new Error('Power to low'),
      );

      await expect(
        widgetApi.receiveStateEvents('com.example.test'),
      ).rejects.toThrow('Power to low');
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        undefined,
      );
    });

    it("should return empty array if state event doesn't exist", async () => {
      matrixWidgetApi.readStateEvents.mockResolvedValue([]);

      await expect(
        widgetApi.receiveStateEvents('com.example.test'),
      ).resolves.toEqual([]);
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        undefined,
      );
    });
  });

  describe('observeStateEvents', () => {
    it('should receive updates about state events', async () => {
      const preventDefault = jest.fn();
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
          state_key: '',
        }),
      ]);
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: {
            data: mockRoomEvent({
              state_key: '',
              content: { 'how are you': 'world' },
            }),
          },
          preventDefault,
        });
        setTimeout(() => {
          listener({
            detail: {
              data: mockRoomEvent({
                state_key: '',
                content: { bye: 'world' },
              }),
            },
            preventDefault,
          });
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      const $events = widgetApi.observeStateEvents('com.example.test');
      const events = await firstValueFrom($events.pipe(take(3), toArray()));

      expect(events).toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          state_key: '',
          content: { hello: 'world' },
        }),
        expect.objectContaining({
          type: 'com.example.test',
          state_key: '',
          content: { 'how are you': 'world' },
        }),
        expect.objectContaining({
          type: 'com.example.test',
          state_key: '',
          content: { bye: 'world' },
        }),
      ]);
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        undefined,
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(2);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalledTimes(2);
    });

    it('should receive updates about state events for a custom state key', async () => {
      const preventDefault = jest.fn();
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({
          state_key: 'custom-state-key',
          content: { hello: 'world' },
        }),
      ]);
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: {
            data: mockRoomEvent({
              state_key: 'custom-state-key',
              content: { 'how are you': 'world' },
            }),
          },
          preventDefault,
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      const $events = widgetApi.observeStateEvents('com.example.test', {
        stateKey: 'custom-state-key',
      });
      const events = await firstValueFrom($events.pipe(take(2), toArray()));

      expect(events).toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          state_key: 'custom-state-key',
          content: { hello: 'world' },
        }),
        expect.objectContaining({
          type: 'com.example.test',
          state_key: 'custom-state-key',
          content: { 'how are you': 'world' },
        }),
      ]);
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        'custom-state-key',
        undefined,
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalledTimes(1);
    });

    it('should receive updates about state events for room ids', async () => {
      const preventDefault = jest.fn();
      matrixWidgetApi.readStateEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
          room_id: '!another-room',
        }),
      ]);
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: {
            data: mockRoomEvent({
              state_key: '',
              content: { 'how are you': 'world' },
              room_id: '!another-room',
            }),
          },
          preventDefault,
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      const $events = widgetApi.observeStateEvents('com.example.test', {
        roomIds: ['!another-room'],
      });
      const events = await firstValueFrom($events.pipe(take(2), toArray()));

      expect(events).toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          content: { hello: 'world' },
          room_id: '!another-room',
        }),
        expect.objectContaining({
          type: 'com.example.test',
          state_key: '',
          content: { 'how are you': 'world' },
          room_id: '!another-room',
        }),
      ]);
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.readStateEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        ['!another-room'],
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalledTimes(1);
    });

    it('should error observable if receiving fails', async () => {
      matrixWidgetApi.readStateEvents.mockRejectedValue(
        new Error('Power to low'),
      );

      const $events = widgetApi.observeStateEvents('com.example.test');
      await expect(firstValueFrom($events)).rejects.toThrow('Power to low');
    });
  });

  describe('sendStateEvent', () => {
    it('should send state event', async () => {
      const preventDefault = jest.fn();
      const stateEvent = { hello: 'world' };

      matrixWidgetApi.sendStateEvent.mockResolvedValue({
        event_id: '$event-id',
        room_id: '!current-room',
      });
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        setTimeout(() => {
          listener({
            detail: {
              data: mockRoomEvent({
                state_key: '',
                content: stateEvent,
              }),
            },
            preventDefault,
          });
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.sendStateEvent('com.example.test', stateEvent),
      ).resolves.toMatchObject({
        room_id: '!current-room',
        sender: '@my-user-id',
        state_key: '',
        type: 'com.example.test',
        content: stateEvent,
      });
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.sendStateEvent).toHaveBeenCalled();
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalled();
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();
    });

    it('should send state event with custom state key', async () => {
      const preventDefault = jest.fn();
      const stateEvent = { hello: 'world' };

      matrixWidgetApi.sendStateEvent.mockResolvedValue({
        room_id: '!current-room',
        event_id: '$event-id',
      });
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        setTimeout(() => {
          listener({
            detail: {
              data: mockRoomEvent({
                content: stateEvent,
                state_key: 'custom-state-key',
              }),
            },
            preventDefault,
          });
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.sendStateEvent('com.example.test', stateEvent, {
          stateKey: 'custom-state-key',
        }),
      ).resolves.toMatchObject({
        room_id: '!current-room',
        sender: '@my-user-id',
        state_key: 'custom-state-key',
        type: 'com.example.test',
        content: stateEvent,
      });
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.sendStateEvent).toHaveBeenCalled();
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalled();
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();
    });

    it('should send state event to another room', async () => {
      const preventDefault = jest.fn();
      const stateEvent = { hello: 'world' };

      matrixWidgetApi.sendStateEvent.mockResolvedValue({
        room_id: '!another-room',
        event_id: '$event-id',
      });
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        setTimeout(() => {
          listener({
            detail: {
              data: mockRoomEvent({
                state_key: '',
                room_id: '!another-room',
                content: stateEvent,
              }),
            },
            preventDefault,
          });
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.sendStateEvent('com.example.test', stateEvent, {
          roomId: '!another-room',
        }),
      ).resolves.toMatchObject({
        room_id: '!another-room',
        sender: '@my-user-id',
        state_key: '',
        type: 'com.example.test',
        content: stateEvent,
      });
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.sendStateEvent).toHaveBeenCalled();
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalled();
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();
    });

    it('should reject on error while sending', async () => {
      const stateEvent = { hello: 'world' };

      matrixWidgetApi.sendStateEvent.mockRejectedValue(
        new Error('Power to low'),
      );
      matrixWidgetApi.on.mockReturnThis();
      matrixWidgetApi.off.mockReturnThis();

      await expect(() =>
        widgetApi.sendStateEvent('com.example.test', stateEvent),
      ).rejects.toThrow('Power to low');
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.sendStateEvent).toHaveBeenCalled();
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
    });
  });

  describe('receiveRoomEvents', () => {
    it('should receive room event', async () => {
      matrixWidgetApi.readRoomEvents.mockResolvedValue([
        mockRoomEvent({ content: { hello: 'world' } }),
        mockRoomEvent({ content: { bye: 'world' } }),
      ]);

      await expect(
        widgetApi.receiveRoomEvents('com.example.test'),
      ).resolves.toEqual([
        expect.objectContaining({ content: { hello: 'world' } }),
        expect.objectContaining({ content: { bye: 'world' } }),
      ]);
      expect(matrixWidgetApi.readRoomEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        undefined,
      );
    });

    it('should receive room event with custom message type', async () => {
      matrixWidgetApi.readRoomEvents.mockResolvedValue([
        mockRoomEvent({ content: { hello: 'world' } }),
      ]);

      await expect(
        widgetApi.receiveRoomEvents('com.example.test', {
          messageType: 'custom-message-type',
        }),
      ).resolves.toEqual([
        expect.objectContaining({ content: { hello: 'world' } }),
      ]);
      expect(matrixWidgetApi.readRoomEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        'custom-message-type',
        undefined,
      );
    });

    it('should receive room event with wildcard room ids', async () => {
      matrixWidgetApi.readRoomEvents.mockResolvedValue([
        mockRoomEvent({ content: { hello: 'world' }, room_id: '!custom-room' }),
      ]);

      await expect(
        widgetApi.receiveRoomEvents('com.example.test', {
          roomIds: ['!custom-room'],
        }),
      ).resolves.toEqual([
        expect.objectContaining({
          content: { hello: 'world' },
          room_id: '!custom-room',
        }),
      ]);
      expect(matrixWidgetApi.readRoomEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        ['!custom-room'],
      );
    });

    it('should receive room event with room ids', async () => {
      matrixWidgetApi.readRoomEvents.mockResolvedValue([
        mockRoomEvent({ content: { hello: 'world' } }),
      ]);

      await expect(
        widgetApi.receiveRoomEvents('com.example.test', {
          roomIds: Symbols.AnyRoom,
        }),
      ).resolves.toEqual([
        expect.objectContaining({ content: { hello: 'world' } }),
      ]);
      expect(matrixWidgetApi.readRoomEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        [Symbols.AnyRoom],
      );
    });

    it('should reject if receiving room event fails', async () => {
      matrixWidgetApi.readRoomEvents.mockRejectedValue(
        new Error('Power to low'),
      );

      await expect(
        widgetApi.receiveRoomEvents('com.example.test'),
      ).rejects.toThrow('Power to low');
      expect(matrixWidgetApi.readRoomEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        undefined,
      );
    });
  });

  describe('observeRoomEvents', () => {
    it('should receive updates about room events', async () => {
      const preventDefault = jest.fn();
      matrixWidgetApi.readRoomEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
        }),
      ]);
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: {
            data: mockRoomEvent({
              content: { 'how are you': 'world' },
            }),
          },
          preventDefault,
        });
        setTimeout(() => {
          listener({
            detail: {
              data: mockRoomEvent({
                content: { bye: 'world' },
              }),
            },
            preventDefault,
          });
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      const $events = widgetApi.observeRoomEvents('com.example.test');
      const events = await firstValueFrom($events.pipe(take(3), toArray()));

      expect(events).toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          content: { hello: 'world' },
          room_id: '!current-room',
        }),
        expect.objectContaining({
          type: 'com.example.test',
          content: { 'how are you': 'world' },
          room_id: '!current-room',
        }),
        expect.objectContaining({
          type: 'com.example.test',
          content: { bye: 'world' },
          room_id: '!current-room',
        }),
      ]);
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.readRoomEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        undefined,
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(2);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalledTimes(2);
    });

    it('should receive updates about room events for a custom message type', async () => {
      const preventDefault = jest.fn();
      matrixWidgetApi.readRoomEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world', msgtype: 'my-message-type' },
        }),
      ]);
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: {
            data: mockRoomEvent({
              content: { 'how are you': 'world', msgtype: 'my-message-type' },
            }),
          },
          preventDefault,
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      const $events = widgetApi.observeRoomEvents('com.example.test', {
        messageType: 'my-message-type',
      });
      const events = await firstValueFrom($events.pipe(take(2), toArray()));

      expect(events).toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          content: { hello: 'world', msgtype: 'my-message-type' },
          room_id: '!current-room',
        }),
        expect.objectContaining({
          type: 'com.example.test',
          content: { 'how are you': 'world', msgtype: 'my-message-type' },
          room_id: '!current-room',
        }),
      ]);
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.readRoomEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        'my-message-type',
        undefined,
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalledTimes(1);
    });

    it('should receive updates about room events for room ids', async () => {
      const preventDefault = jest.fn();
      matrixWidgetApi.readRoomEvents.mockResolvedValue([
        mockRoomEvent({
          content: { hello: 'world' },
          room_id: '!another-room',
        }),
      ]);
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: {
            data: mockRoomEvent({
              content: { 'how are you': 'world' },
              room_id: '!another-room',
            }),
          },
          preventDefault,
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      const $events = widgetApi.observeRoomEvents('com.example.test', {
        roomIds: ['!another-room'],
      });
      const events = await firstValueFrom($events.pipe(take(2), toArray()));

      expect(events).toEqual([
        expect.objectContaining({
          type: 'com.example.test',
          content: { hello: 'world' },
          room_id: '!another-room',
        }),
        expect.objectContaining({
          type: 'com.example.test',
          content: { 'how are you': 'world' },
          room_id: '!another-room',
        }),
      ]);
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.readRoomEvents).toHaveBeenCalledWith(
        'com.example.test',
        Number.MAX_SAFE_INTEGER,
        undefined,
        ['!another-room'],
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalledTimes(1);
    });

    it('should error observable if receiving fails', async () => {
      matrixWidgetApi.readRoomEvents.mockRejectedValue(
        new Error('Power to low'),
      );

      const $events = widgetApi.observeRoomEvents('com.example.test');
      await expect(firstValueFrom($events)).rejects.toThrow('Power to low');
    });
  });

  describe('sendRoomEvent', () => {
    it('should send room event', async () => {
      const preventDefault = jest.fn();
      const roomEvent = { hello: 'world' };

      matrixWidgetApi.sendRoomEvent.mockResolvedValue({
        room_id: '!current-room',
        event_id: '$event-id',
      });
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        setTimeout(() => {
          listener({
            detail: {
              data: mockRoomEvent({
                room_id: '!current-room',
                content: roomEvent,
              }),
            },
            preventDefault,
          });
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.sendRoomEvent('com.example.test', roomEvent),
      ).resolves.toMatchObject({
        room_id: '!current-room',
        sender: '@my-user-id',
        type: 'com.example.test',
        content: roomEvent,
      });
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.sendRoomEvent).toHaveBeenCalled();
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalled();
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();
    });

    it('should send room event to another room', async () => {
      const preventDefault = jest.fn();
      const roomEvent = { hello: 'world' };

      matrixWidgetApi.sendRoomEvent.mockResolvedValue({
        room_id: '!another-room',
        event_id: '$event-id',
      });
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        setTimeout(() => {
          listener({
            detail: {
              data: mockRoomEvent({
                room_id: '!another-room',
                content: roomEvent,
              }),
            },
            preventDefault,
          });
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.sendRoomEvent('com.example.test', roomEvent, {
          roomId: '!another-room',
        }),
      ).resolves.toMatchObject({
        room_id: '!another-room',
        sender: '@my-user-id',
        type: 'com.example.test',
        content: roomEvent,
      });
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.sendRoomEvent).toHaveBeenCalled();
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalled();
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();
    });

    it('should reject on error while sending', async () => {
      const roomEvent = { hello: 'world' };

      matrixWidgetApi.sendRoomEvent.mockRejectedValue(
        new Error('Power to low'),
      );
      matrixWidgetApi.on.mockImplementationOnce((eventName) => {
        expect(eventName).toEqual('action:send_event');
        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(() =>
        widgetApi.sendRoomEvent('com.example.test', roomEvent),
      ).rejects.toThrow('Power to low');
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
      expect(matrixWidgetApi.sendRoomEvent).toHaveBeenCalled();
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_event',
        expect.any(Function),
      );
    });
  });

  describe('sendToDeviceMessage', () => {
    it('should send to device message', async () => {
      await widgetApi.sendToDeviceMessage('com.example.message', false, {
        '@user-id': {
          '*': {
            hello: 'world',
          },
        },
      });

      expect(matrixWidgetApi.sendToDevice).toHaveBeenCalledWith(
        'com.example.message',
        false,
        { '@user-id': { '*': { hello: 'world' } } },
      );
    });
  });

  describe('observeToDeviceMessages', () => {
    it('should receive updates about to device messages', async () => {
      const preventDefault = jest.fn();
      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: {
            data: mockToDeviceMessage({
              content: { 'how are you': 'world' },
            }),
          },
          preventDefault,
        });
        listener({
          detail: {
            data: mockToDeviceMessage({
              type: 'com.example.other',
              content: { not: 'displayed' },
            }),
          },
          preventDefault,
        });
        setTimeout(() => {
          listener({
            detail: {
              data: mockToDeviceMessage({
                content: { bye: 'world' },
              }),
            },
            preventDefault,
          });
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      const $events = widgetApi.observeToDeviceMessages('com.example.message');
      const events = await firstValueFrom($events.pipe(take(2), toArray()));

      expect(events).toEqual([
        {
          type: 'com.example.message',
          content: { 'how are you': 'world' },
          sender: '@my-user-id',
          encrypted: false,
        },
        {
          type: 'com.example.message',
          content: { bye: 'world' },
          sender: '@my-user-id',
          encrypted: false,
        },
      ]);
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:send_to_device',
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:send_to_device',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(3);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalledTimes(3);
    });
  });

  describe('openModal', () => {
    it('should open modal', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: false,
        mainWidgetId: '',
      });

      const preventDefault = jest.fn();

      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: { data: { data: 'my-return-data' } },
          preventDefault,
        });
        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      await expect(
        widgetApi.openModal('/modal', 'My Modal', {
          buttons: [],
          data: { string: 'example' },
        }),
      ).resolves.toEqual({
        data: 'my-return-data',
      });

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
      expect(matrixWidgetApi.openModalWidget).toHaveBeenCalledWith(
        'http://localhost/modal#/?theme=$org.matrix.msc2873.client_theme&matrix_user_id=@my-user-id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=!current-room&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
        'My Modal',
        [],
        { string: 'example' },
      );
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:close_modal',
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:close_modal',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();
    });

    it('should fail to open modal due to error while acknowledgement', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: false,
        mainWidgetId: '',
      });

      const preventDefault = jest.fn();

      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: { data: { data: 'my-return-data' } },
          preventDefault,
        });
        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();
      matrixWidgetApi.transport.reply.mockImplementation(() => {
        throw new Error('Transport Error');
      });

      await expect(
        widgetApi.openModal('/modal', 'My Modal', {
          buttons: [],
          data: { string: 'example' },
        }),
      ).rejects.toThrow('Transport Error');

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
      expect(matrixWidgetApi.openModalWidget).toHaveBeenCalledWith(
        'http://localhost/modal#/?theme=$org.matrix.msc2873.client_theme&matrix_user_id=@my-user-id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=!current-room&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
        'My Modal',
        [],
        { string: 'example' },
      );
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:close_modal',
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:close_modal',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalled();
    });

    it('should throw if called from a modal', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: true,
        mainWidgetId: '',
      });

      await expect(widgetApi.openModal('/example', 'My Modal')).rejects.toThrow(
        /Modals can't be opened from another modal widget/,
      );

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
    });
  });

  describe('setModalButtonEnabled', () => {
    it('should enable button', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: true,
        mainWidgetId: '',
      });

      await expect(
        widgetApi.setModalButtonEnabled('button.id', true),
      ).resolves.toBeUndefined();

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
      expect(matrixWidgetApi.setModalButtonEnabled).toHaveBeenCalledWith(
        'button.id',
        true,
      );
    });

    it('should throw if not called from a modal', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: false,
        mainWidgetId: '',
      });

      await expect(
        widgetApi.setModalButtonEnabled('button.id', true),
      ).rejects.toThrow(
        /Modal buttons can only be enabled from a modal widget/,
      );

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
    });
  });

  describe('observeModalButtons', () => {
    it('should receive button clicks', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: true,
        mainWidgetId: '',
      });

      const preventDefault = jest.fn();

      matrixWidgetApi.on.mockImplementationOnce((_, listener) => {
        listener({
          detail: { data: { id: 'button.first' } },
          preventDefault,
        });

        return matrixWidgetApi;
      });
      matrixWidgetApi.off.mockReturnThis();

      const $events = widgetApi.observeModalButtons();
      const event = await firstValueFrom($events);

      expect(event).toEqual('button.first');

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
      expect(matrixWidgetApi.on).toHaveBeenCalledWith(
        'action:button_clicked',
        expect.any(Function),
      );
      expect(matrixWidgetApi.off).toHaveBeenCalledWith(
        'action:button_clicked',
        expect.any(Function),
      );
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(matrixWidgetApi.transport.reply).toHaveBeenCalledTimes(1);
    });

    it('should throw if not called from a modal', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: false,
        mainWidgetId: '',
      });

      expect(() => widgetApi.observeModalButtons()).toThrow(
        /Modal buttons can only be observed from a modal widget/,
      );

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
    });
  });

  describe('closeModal', () => {
    it('should close the modal', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: true,
        mainWidgetId: '',
      });

      await expect(widgetApi.closeModal()).resolves.toBeUndefined();

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
      expect(matrixWidgetApi.closeModalWidget).toHaveBeenCalledWith({
        'm.exited': true,
      });
    });

    it('should close the modal with custom data', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: true,
        mainWidgetId: '',
      });

      await expect(
        widgetApi.closeModal({ my: 'data' }),
      ).resolves.toBeUndefined();

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
      expect(matrixWidgetApi.closeModalWidget).toHaveBeenCalledWith({
        my: 'data',
      });
    });

    it('should throw if not called from a modal', async () => {
      parseWidgetId.mockReturnValueOnce({
        isModal: false,
        mainWidgetId: '',
      });

      await expect(widgetApi.closeModal()).rejects.toThrow(
        /Modals can only be closed from a modal widget/,
      );

      expect(parseWidgetId).toHaveBeenCalledWith('widget-id');
    });
  });

  describe('navigateTo', () => {
    it('should navigate', async () => {
      await expect(
        widgetApi.navigateTo('https://matrix.to/#/#room:example.com'),
      ).resolves.toBeUndefined();

      expect(matrixWidgetApi.navigateTo).toHaveBeenCalledWith(
        'https://matrix.to/#/#room:example.com',
      );
    });
  });

  describe('requestOpenIDConnectToken', () => {
    it('should request OIDC token', async () => {
      const token = {
        access_token: 'my-token',
        expires_in: 60,
        matrix_server_name: 'https://home-server',
        token_type: 'Bearer',
      };

      matrixWidgetApi.requestOpenIDConnectToken.mockResolvedValue(token);

      await expect(widgetApi.requestOpenIDConnectToken()).resolves.toEqual(
        token,
      );
    });

    it('should queue parallel OIDC token requests', async () => {
      const token = {
        access_token: 'my-token',
        expires_in: 60,
        matrix_server_name: 'https://home-server',
        token_type: 'Bearer',
      };

      const requestOpenIDConnectTokenCompleter =
        new ReplaySubject<IOpenIDCredentials>();

      matrixWidgetApi.requestOpenIDConnectToken.mockImplementation(async () => {
        return await firstValueFrom(requestOpenIDConnectTokenCompleter);
      });

      const firstResultPromise = widgetApi.requestOpenIDConnectToken();
      const secondResultPromise = widgetApi.requestOpenIDConnectToken();

      requestOpenIDConnectTokenCompleter.next(token);

      await expect(firstResultPromise).resolves.toEqual(token);
      await expect(secondResultPromise).resolves.toEqual(token);

      // Parallel requests should only request it via the widget api once.
      expect(matrixWidgetApi.requestOpenIDConnectToken).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should cache OIDC token', async () => {
      const token = {
        access_token: 'my-token',
        expires_in: 60,
        matrix_server_name: 'https://home-server',
        token_type: 'Bearer',
      };

      matrixWidgetApi.requestOpenIDConnectToken.mockResolvedValue(token);

      await expect(widgetApi.requestOpenIDConnectToken()).resolves.toEqual(
        token,
      );
      await expect(widgetApi.requestOpenIDConnectToken()).resolves.toEqual(
        token,
      );

      expect(matrixWidgetApi.requestOpenIDConnectToken).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should refresh OIDC token once it is to old', async () => {
      const dateNow = jest.spyOn(Date, 'now').mockReturnValue(1646000000000);
      const token = {
        access_token: 'my-token',
        expires_in: 60,
        matrix_server_name: 'https://home-server',
        token_type: 'Bearer',
      };
      const tokenNew = {
        access_token: 'my-new-token',
        expires_in: 60,
        matrix_server_name: 'https://home-server',
        token_type: 'Bearer',
      };
      matrixWidgetApi.requestOpenIDConnectToken.mockResolvedValueOnce(token);
      matrixWidgetApi.requestOpenIDConnectToken.mockResolvedValueOnce(tokenNew);

      await expect(widgetApi.requestOpenIDConnectToken()).resolves.toEqual(
        token,
      );

      dateNow.mockReturnValue(1646000000000 + 45 * 1000);

      await expect(widgetApi.requestOpenIDConnectToken()).resolves.toEqual(
        tokenNew,
      );
    });
  });

  describe('observeTurnServers', () => {
    it('should return turn servers', async () => {
      matrixWidgetApi.getTurnServers.mockImplementation(async function* () {
        yield {
          uris: ['turn:turn1.example.com'],
          username: 'user1',
          password: 'secret1',
        };
        yield {
          uris: ['turn:turn2.example.com'],
          username: 'user2',
          password: 'secret2',
        };
        await new Promise(() => {
          /* never resolves */
        });
      });

      const turnServersPromise = firstValueFrom(
        widgetApi.observeTurnServers().pipe(take(2), toArray()),
      );

      await expect(turnServersPromise).resolves.toEqual([
        {
          urls: ['turn:turn1.example.com'],
          username: 'user1',
          credential: 'secret1',
        },
        {
          urls: ['turn:turn2.example.com'],
          username: 'user2',
          credential: 'secret2',
        },
      ]);
    });
  });

  describe('readEventRelations', () => {
    it('should read event relations', async () => {
      matrixWidgetApi.readEventRelations.mockResolvedValue({
        chunk: [],
        original_event: mockRoomEvent(),
        next_batch: 'batch',
      });

      await expect(
        widgetApi.readEventRelations('$event-id', {
          roomId: '!room-id',
          limit: 5,
          from: 'from-token',
          relationType: 'm.reference',
          eventType: 'm.room.message',
          direction: 'f',
        }),
      ).resolves.toEqual({
        chunk: [],
        nextToken: 'batch',
      });
      expect(matrixWidgetApi.readEventRelations).toHaveBeenCalledWith(
        '$event-id',
        '!room-id',
        'm.reference',
        'm.room.message',
        5,
        'from-token',
        undefined,
        'f',
      );
    });

    it('should reject if reading the relations room event fails', async () => {
      matrixWidgetApi.readEventRelations.mockRejectedValue(
        new Error('Power to low'),
      );

      await expect(widgetApi.readEventRelations('$event-id')).rejects.toThrow(
        'Power to low',
      );
      expect(matrixWidgetApi.readEventRelations).toHaveBeenCalledWith(
        '$event-id',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('searchUserDirectory', () => {
    it('should search the user directory', async () => {
      matrixWidgetApi.searchUserDirectory.mockResolvedValue({
        limited: true,
        results: [
          {
            user_id: '@user-id',
            display_name: 'User',
            avatar_url: 'mxc://...',
          },
        ],
      });

      await expect(
        widgetApi.searchUserDirectory('user', { limit: 5 }),
      ).resolves.toEqual({
        results: [
          { userId: '@user-id', displayName: 'User', avatarUrl: 'mxc://...' },
        ],
      });
      expect(matrixWidgetApi.searchUserDirectory).toHaveBeenCalledWith(
        'user',
        5,
      );
    });

    it('should reject if reading the relations room event fails', async () => {
      matrixWidgetApi.searchUserDirectory.mockRejectedValue(
        new Error('Power to low'),
      );

      await expect(widgetApi.searchUserDirectory('user')).rejects.toThrow(
        'Power to low',
      );
      expect(matrixWidgetApi.searchUserDirectory).toHaveBeenCalledWith(
        'user',
        undefined,
      );
    });
  });

  describe('getMediaConfig', () => {
    it('should get media config', async () => {
      matrixWidgetApi.getMediaConfig.mockResolvedValue(
        Promise.resolve({
          'm.upload.size': 5444,
        }),
      );

      await expect(widgetApi.getMediaConfig()).resolves.toEqual({
        'm.upload.size': 5444,
      });
      expect(matrixWidgetApi.getMediaConfig).toHaveBeenCalledWith();
    });
  });

  describe('uploadFile', () => {
    it('should upload a file', async () => {
      matrixWidgetApi.uploadFile.mockResolvedValue(
        Promise.resolve({
          content_uri: 'msx//:example',
        }),
      );

      const file = new File(['file content'], 'test-image.png', {
        type: 'image/png',
      });

      await expect(widgetApi.uploadFile(file)).resolves.toEqual({
        content_uri: 'msx//:example',
      });
      expect(matrixWidgetApi.uploadFile).toHaveBeenCalled();
    });

    it('should throw error', async () => {
      matrixWidgetApi.uploadFile.mockRejectedValue(
        new Error('can not upload the file'),
      );

      await expect(widgetApi.uploadFile('file')).rejects.toThrow(
        'can not upload the file',
      );
      expect(matrixWidgetApi.uploadFile).toHaveBeenCalledWith('file');
    });
  });
});

function mockRoomEvent<T>({
  content,
  type = 'com.example.test',
  room_id = '!current-room',
  state_key,
}: {
  content?: T;
  type?: string;
  room_id?: string;
  state_key?: string;
} = {}): IRoomEvent {
  return {
    content: content ?? {},
    room_id,
    type,
    state_key,
    event_id: '$event-id',
    origin_server_ts: 0,
    sender: '@my-user-id',
    unsigned: {},
  };
}

function mockToDeviceMessage<T>({
  content,
  type = 'com.example.message',
  encrypted = false,
}: {
  content?: T;
  type?: string;
  encrypted?: boolean;
} = {}): ToDeviceMessageEvent {
  return {
    content: content ?? {},
    type,
    sender: '@my-user-id',
    encrypted,
  };
}

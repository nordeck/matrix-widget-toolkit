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

import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import {
  generateWidgetRegistrationUrl,
  hasWidgetParameters,
  repairWidgetRegistration,
  STATE_EVENT_WIDGETS,
} from './registration';
import { WidgetApi } from './types';

describe('hasWidgetParameters', () => {
  it('should fail if a parameter is missing', () => {
    const widgetApi = {
      widgetParameters: {
        displayName: 'my-display-name',
      },
    } as Partial<WidgetApi> as WidgetApi;

    expect(hasWidgetParameters(widgetApi)).toEqual(false);
  });

  it('should succeed if all required parameter are available', () => {
    const widgetApi = {
      widgetParameters: {
        displayName: 'my-display-name',
        avatarUrl: 'my-avatar-url',
        roomId: 'my-room-id',
        userId: 'my-user-id',
        theme: 'my-theme',
        clientId: 'my-client-id',
        clientLanguage: 'my-client-language',
        deviceId: 'my-device-id',
        baseUrl: 'my-base-url',
      },
    } as Partial<WidgetApi> as WidgetApi;

    expect(hasWidgetParameters(widgetApi)).toEqual(true);
  });

  it('should succeed, even if a parameter is just an empty string', () => {
    const widgetApi: WidgetApi = {
      widgetParameters: {
        displayName: '',
        avatarUrl: '',
        roomId: '',
        userId: '',
        theme: '',
        clientId: '',
        clientLanguage: '',
        deviceId: '',
        baseUrl: '',
      },
    } as Partial<WidgetApi> as WidgetApi;

    expect(hasWidgetParameters(widgetApi)).toEqual(true);
  });
});

describe('generateWidgetRegistrationUrl', () => {
  it('should generate widget registration URL', () => {
    mockLocation('https://example.com');
    const url = generateWidgetRegistrationUrl();

    expect(url).toEqual(
      'https://example.com/#/?theme=$org.matrix.msc2873.client_theme&matrix_user_id=$matrix_user_id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=$matrix_room_id&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&matrix_device_id=$org.matrix.msc3819.matrix_device_id&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
    );
  });

  it('should generate widget registration URL with parameters', () => {
    mockLocation('https://example.com');
    const url = generateWidgetRegistrationUrl({
      widgetParameters: {
        theme: 'my-theme',
        userId: 'my-userId',
        displayName: 'my-displayName',
        avatarUrl: 'my-avatarUrl',
        roomId: 'my-roomId',
        clientId: 'my-clientId',
        clientLanguage: 'my-clientLanguage',
        deviceId: 'my-deviceId',
        baseUrl: 'my-baseUrl',
      },
    });

    expect(url).toEqual(
      'https://example.com/#/?theme=my-theme&matrix_user_id=my-userId&matrix_display_name=my-displayName&matrix_avatar_url=my-avatarUrl&matrix_room_id=my-roomId&matrix_client_id=my-clientId&matrix_client_language=my-clientLanguage&matrix_device_id=my-deviceId&matrix_base_url=my-baseUrl',
    );
  });

  it('should generate widget registration URL for custom path', () => {
    mockLocation('https://example.com');
    const url = generateWidgetRegistrationUrl({ pathName: 'custom' });

    expect(url).toEqual(
      'https://example.com/custom#/?theme=$org.matrix.msc2873.client_theme&matrix_user_id=$matrix_user_id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=$matrix_room_id&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&matrix_device_id=$org.matrix.msc3819.matrix_device_id&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
    );
  });

  it('should generate widget registration URL without parameters', () => {
    mockLocation('https://example.com');
    const url = generateWidgetRegistrationUrl({ includeParameters: false });

    expect(url).toEqual('https://example.com/');
  });

  it('should forward unknown parameters and reset known parameters', () => {
    mockLocation(
      'https://example.com/?widgetId=some-id&parentUrl=some-url&some_query_parameter=some-value#/?theme=light&matrix_user_id=some-user&matrix_display_name=some-name&matrix_avatar_url=some-avatar&matrix_room_id=some-room&matrix_client_id=some-id&matrix_client_language=en&some_hash_parameter=some-value',
    );
    const url = generateWidgetRegistrationUrl();

    expect(url).toEqual(
      'https://example.com/#/?some_query_parameter=some-value&theme=$org.matrix.msc2873.client_theme&matrix_user_id=$matrix_user_id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=$matrix_room_id&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&some_hash_parameter=some-value&matrix_device_id=$org.matrix.msc3819.matrix_device_id&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
    );
  });
});

describe('repairWidgetRegistration', () => {
  let widgetApi: Mocked<WidgetApi>;

  beforeEach(() => {
    widgetApi = {
      widgetId: 'my-widget-id',
      requestCapabilities: vi.fn(),
      receiveSingleStateEvent: vi.fn(),
      sendStateEvent: vi.fn(),
    } as Partial<Mocked<WidgetApi>> as Mocked<WidgetApi>;

    mockLocation('https://example.com/');
  });

  it('should update widget URL, type, name, and data', async () => {
    const widgetStateEvent = {
      type: 'type',
      sender: 'sender',
      event_id: 'event-id',
      room_id: 'room-id',
      origin_server_ts: 1,
      state_key: 'widget-id',
      content: {
        id: 'widget-id',
        name: 'Custom Widget',
        type: 'm.custom',
        data: {},
        url: '…',
      },
    };
    widgetApi.receiveSingleStateEvent.mockResolvedValue(widgetStateEvent);
    widgetApi.sendStateEvent.mockResolvedValue(widgetStateEvent);

    await repairWidgetRegistration(widgetApi, {
      name: 'New Widget',
      type: 'com.example.clock',
      data: {
        title: 'Hello World',
      },
    });

    expect(widgetApi.requestCapabilities).toHaveBeenCalled();
    expect(widgetApi.receiveSingleStateEvent).toHaveBeenCalledWith(
      STATE_EVENT_WIDGETS,
      'my-widget-id',
    );
    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      STATE_EVENT_WIDGETS,
      {
        id: 'widget-id',
        name: 'New Widget',
        type: 'com.example.clock',
        data: {
          title: 'Hello World',
        },
        url: 'https://example.com/#/?theme=$org.matrix.msc2873.client_theme&matrix_user_id=$matrix_user_id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=$matrix_room_id&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&matrix_device_id=$org.matrix.msc3819.matrix_device_id&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
      },
      { stateKey: 'my-widget-id' },
    );
  });

  it('should update widget name, if the name is "Custom"', async () => {
    const widgetStateEvent = {
      type: 'type',
      sender: 'sender',
      event_id: 'event-id',
      room_id: 'room-id',
      origin_server_ts: 1,
      state_key: 'widget-id',
      content: {
        id: 'widget-id',
        name: 'Custom',
        type: 'com.example.existing',
        data: {},
        url: '…',
      },
    };
    widgetApi.receiveSingleStateEvent.mockResolvedValue(widgetStateEvent);
    widgetApi.sendStateEvent.mockResolvedValue(widgetStateEvent);

    await repairWidgetRegistration(widgetApi, {
      name: 'New Widget',
      type: 'com.example.existing',
      data: {
        title: 'Hello World',
      },
    });

    expect(widgetApi.requestCapabilities).toHaveBeenCalled();
    expect(widgetApi.receiveSingleStateEvent).toHaveBeenCalledWith(
      STATE_EVENT_WIDGETS,
      'my-widget-id',
    );
    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      STATE_EVENT_WIDGETS,
      {
        id: 'widget-id',
        name: 'New Widget',
        type: 'com.example.existing',
        data: {
          title: 'Hello World',
        },
        url: 'https://example.com/#/?theme=$org.matrix.msc2873.client_theme&matrix_user_id=$matrix_user_id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=$matrix_room_id&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&matrix_device_id=$org.matrix.msc3819.matrix_device_id&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
      },
      { stateKey: 'my-widget-id' },
    );
  });

  it('should keep URL path', async () => {
    mockLocation('https://example.com/path');
    const widgetStateEvent = {
      type: 'type',
      sender: 'sender',
      event_id: 'event-id',
      room_id: 'room-id',
      origin_server_ts: 1,
      state_key: 'widget-id',
      content: {
        id: 'widget-id',
        name: 'Custom Widget',
        type: 'm.custom',
        data: {},
        url: '…',
      },
    };
    widgetApi.receiveSingleStateEvent.mockResolvedValue(widgetStateEvent);
    widgetApi.sendStateEvent.mockResolvedValue(widgetStateEvent);

    await repairWidgetRegistration(widgetApi, {
      name: 'New Widget',
      type: 'com.example.clock',
      data: {
        title: 'Hello World',
      },
    });

    expect(widgetApi.requestCapabilities).toHaveBeenCalled();
    expect(widgetApi.receiveSingleStateEvent).toHaveBeenCalledWith(
      STATE_EVENT_WIDGETS,
      'my-widget-id',
    );
    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      STATE_EVENT_WIDGETS,
      {
        id: 'widget-id',
        name: 'New Widget',
        type: 'com.example.clock',
        data: {
          title: 'Hello World',
        },
        url: 'https://example.com/path/#/?theme=$org.matrix.msc2873.client_theme&matrix_user_id=$matrix_user_id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=$matrix_room_id&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&matrix_device_id=$org.matrix.msc3819.matrix_device_id&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
      },
      { stateKey: 'my-widget-id' },
    );
  });

  it('should keep widget name and type untouched if a custom one is already set', async () => {
    const widgetStateEvent = {
      type: 'type',
      sender: 'sender',
      event_id: 'event-id',
      room_id: 'room-id',
      origin_server_ts: 1,
      state_key: 'widget-id',
      content: {
        id: 'widget-id',
        name: 'My Widget',
        type: 'com.example.existing',
        data: {
          some: 'value',
        },
        url: '…',
      },
    };
    widgetApi.receiveSingleStateEvent.mockResolvedValue(widgetStateEvent);
    widgetApi.sendStateEvent.mockResolvedValue(widgetStateEvent);

    await repairWidgetRegistration(widgetApi, {
      name: 'New Widget',
      type: 'com.example.clock',
      data: {
        title: 'Hello World',
      },
    });

    expect(widgetApi.requestCapabilities).toHaveBeenCalled();
    expect(widgetApi.receiveSingleStateEvent).toHaveBeenCalledWith(
      STATE_EVENT_WIDGETS,
      'my-widget-id',
    );
    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      STATE_EVENT_WIDGETS,
      {
        id: 'widget-id',
        name: 'My Widget',
        type: 'com.example.existing',
        data: {
          some: 'value',
          title: 'Hello World',
        },
        url: 'https://example.com/#/?theme=$org.matrix.msc2873.client_theme&matrix_user_id=$matrix_user_id&matrix_display_name=$matrix_display_name&matrix_avatar_url=$matrix_avatar_url&matrix_room_id=$matrix_room_id&matrix_client_id=$org.matrix.msc2873.client_id&matrix_client_language=$org.matrix.msc2873.client_language&matrix_device_id=$org.matrix.msc3819.matrix_device_id&matrix_base_url=$org.matrix.msc4039.matrix_base_url',
      },
      { stateKey: 'my-widget-id' },
    );
  });
});

function mockLocation(url: string): void {
  Reflect.deleteProperty(window, 'location');
  window.location = new URL(url) as unknown as Location;
}

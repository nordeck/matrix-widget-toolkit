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

import { describe, expect, it } from 'vitest';
import {
  extractRawWidgetParameters,
  extractWidgetApiParameters,
  extractWidgetParameters,
  parseWidgetId,
} from './parameters';

describe('extractWidgetApiParameters', () => {
  it('should extract parentUrl and widgetId from location', () => {
    mockLocation(
      'https://example.com/widget?parentUrl=https://my-parent-url&widgetId=my-widget-id',
    );
    const { widgetId, clientOrigin } = extractWidgetApiParameters();

    expect(widgetId).toEqual('my-widget-id');
    expect(clientOrigin).toEqual('https://my-parent-url');
  });

  it('should fail if parentUrl is missing from location', () => {
    mockLocation('https://example.com/widget?widgetId=my-widget-id');

    expect(() => extractWidgetApiParameters()).toThrow(
      'Missing parameter "parentUrl"',
    );
  });

  it('should fail if widgetId is missing from location', () => {
    mockLocation('https://example.com/widget?parentUrl=https://my-parent-url');

    expect(() => extractWidgetApiParameters()).toThrow(
      'Missing parameter "widgetId"',
    );
  });
});

describe('extractRawWidgetParameters', () => {
  it('should read parameters from hash', () => {
    mockLocation(
      'https://example.com/widget?parentUrl=https://my-parent-url#/?matrix_user_id=my-user-id&custom_parameter=custom-value',
    );
    const params = extractRawWidgetParameters();

    expect(params).toEqual({
      parentUrl: 'https://my-parent-url',
      matrix_user_id: 'my-user-id',
      custom_parameter: 'custom-value',
    });
  });

  it('should read parameters from query string for backward compatibility', () => {
    mockLocation(
      'https://example.com/widget?parentUrl=https://my-parent-url&matrix_user_id=my-user-id&custom_parameter=custom-value',
    );

    const params = extractRawWidgetParameters();

    expect(params).toEqual({
      parentUrl: 'https://my-parent-url',
      matrix_user_id: 'my-user-id',
      custom_parameter: 'custom-value',
    });
  });
});

describe('extractWidgetParameters', () => {
  it('should read parameters from hash', () => {
    mockLocation(
      'https://example.com/widget?parentUrl=https://my-parent-url#/?matrix_user_id=my-user-id&matrix_display_name=my-display-name&matrix_avatar_url=my-avatar-url&matrix_room_id=my-room-id&theme=my-theme&matrix_client_id=my-client-id&matrix_client_language=my-client-language&matrix_base_url=my-base-url',
    );
    const {
      userId,
      roomId,
      displayName,
      avatarUrl,
      theme,
      clientId,
      clientLanguage,
      baseUrl,
    } = extractWidgetParameters();

    expect(userId).toEqual('my-user-id');
    expect(displayName).toEqual('my-display-name');
    expect(avatarUrl).toEqual('my-avatar-url');
    expect(roomId).toEqual('my-room-id');
    expect(theme).toEqual('my-theme');
    expect(clientId).toEqual('my-client-id');
    expect(clientLanguage).toEqual('my-client-language');
    expect(baseUrl).toEqual('my-base-url');
  });

  it('should read parameters from query string for backward compatibility', () => {
    mockLocation(
      'https://example.com/widget?parentUrl=https://my-parent-url&matrix_user_id=my-user-id',
    );

    const { userId } = extractWidgetParameters();

    expect(userId).toEqual('my-user-id');
  });

  it('should detect opened by client', () => {
    mockLocation('https://example.com/widget#/?matrix_room_id=my-room-id');

    const { isOpenedByClient } = extractWidgetParameters();

    expect(isOpenedByClient).toEqual(true);
  });

  it('should detect not opened by client (missing parameter)', () => {
    mockLocation('https://example.com/widget');

    const { isOpenedByClient } = extractWidgetParameters();

    expect(isOpenedByClient).toEqual(false);
  });

  it('should detect not opened by client (missing interpolation)', () => {
    mockLocation('https://example.com/widget#/?matrix_room_id=$matrix_room_id');

    const { isOpenedByClient } = extractWidgetParameters();

    expect(isOpenedByClient).toEqual(false);
  });
});

describe('parseWidgetId', () => {
  it('should read roomId, mainWidgetId, creator and isModal from widgetId', () => {
    const widgetId =
      '%21aSudgNJFbTpDfSWxzv%253Asynapse.dev.nordeck.systems_%2540oliver.sand.dev%253Asynapse.dev.nordeck.systems_1638808226691';
    const { creator, roomId, mainWidgetId, isModal } = parseWidgetId(widgetId);

    expect(creator).toEqual('@oliver.sand.dev:synapse.dev.nordeck.systems');
    expect(roomId).toEqual('!aSudgNJFbTpDfSWxzv:synapse.dev.nordeck.systems');
    expect(mainWidgetId).toEqual(
      '!aSudgNJFbTpDfSWxzv%3Asynapse.dev.nordeck.systems_%40oliver.sand.dev%3Asynapse.dev.nordeck.systems_1638808226691',
    );
    expect(isModal).toEqual(false);
  });

  it('should handle widgetIds of modals', () => {
    const widgetId =
      'modal_%21aSudgNJFbTpDfSWxzv%253Asynapse.dev.nordeck.systems_%2540oliver.sand.dev%253Asynapse.dev.nordeck.systems_1638808226691';
    const { creator, roomId, mainWidgetId, isModal } = parseWidgetId(widgetId);

    expect(creator).toEqual('@oliver.sand.dev:synapse.dev.nordeck.systems');
    expect(roomId).toEqual('!aSudgNJFbTpDfSWxzv:synapse.dev.nordeck.systems');
    expect(mainWidgetId).toEqual(
      '!aSudgNJFbTpDfSWxzv%3Asynapse.dev.nordeck.systems_%40oliver.sand.dev%3Asynapse.dev.nordeck.systems_1638808226691',
    );
    expect(isModal).toEqual(true);
  });
});

function mockLocation(url: string): void {
  Reflect.deleteProperty(window, 'location');
  window.location = new URL(url) as unknown as Location;
}

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
import { WidgetApi } from '../types';
import { navigateToRoom } from './navigateTo';

describe('navigateToRoom', () => {
  let widgetApi: Mocked<WidgetApi>;

  beforeEach(() => {
    widgetApi = {
      widgetId: 'widget-id',
      widgetParameters: { isOpenedByClient: true },
      navigateTo: vi.fn(),
    } as Partial<WidgetApi> as Mocked<WidgetApi>;
  });

  it('should navigate', async () => {
    await expect(
      navigateToRoom(widgetApi, '!my-room-id:example.org'),
    ).resolves.toBeUndefined();

    expect(widgetApi.navigateTo).toHaveBeenCalledWith(
      'https://matrix.to/#/!my-room-id%3Aexample.org',
    );
  });

  it('should navigate and pass a homeserver in via', async () => {
    await expect(
      navigateToRoom(widgetApi, '!my-room-id:example.org', {
        via: ['matrix.com'],
      }),
    ).resolves.toBeUndefined();

    expect(widgetApi.navigateTo).toHaveBeenCalledWith(
      'https://matrix.to/#/!my-room-id%3Aexample.org?via=matrix.com',
    );
  });

  it('should navigate and pass multiple homeservers in via', async () => {
    await expect(
      navigateToRoom(widgetApi, '!my-room-id:example.org', {
        via: ['matrix.com', 'example.com'],
      }),
    ).resolves.toBeUndefined();

    expect(widgetApi.navigateTo).toHaveBeenCalledWith(
      'https://matrix.to/#/!my-room-id%3Aexample.org?via=matrix.com&via=example.com',
    );
  });
});

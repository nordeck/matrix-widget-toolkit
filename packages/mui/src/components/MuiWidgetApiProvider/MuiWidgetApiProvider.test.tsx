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
  extractWidgetParameters as extractWidgetParametersMocked,
  hasRequiredWidgetParameters as hasRequiredWidgetParametersMocked,
  WidgetApi,
} from '@matrix-widget-toolkit/api';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import { MuiWidgetApiProvider } from './MuiWidgetApiProvider';

vi.mock('@matrix-widget-toolkit/api');

const hasRequiredWidgetParameters = vi.mocked(
  hasRequiredWidgetParametersMocked,
);

const extractWidgetParameters = vi.mocked(extractWidgetParametersMocked);

describe('WidgetApiProvider', () => {
  let widgetApi: Mocked<WidgetApi>;
  let widgetApiPromise: Promise<WidgetApi>;

  beforeEach(() => {
    widgetApi = {
      widgetId: 'widget-id',
      widgetParameters: { isOpenedByClient: true },
      rerequestInitialCapabilities: vi.fn(),
      hasInitialCapabilities: vi.fn(),
      sendRoomEvent: vi.fn(),
    } as Partial<Mocked<WidgetApi>> as Mocked<WidgetApi>;

    widgetApiPromise = Promise.resolve(widgetApi);

    extractWidgetParameters.mockReturnValue({ isOpenedByClient: true });
  });

  it('should render without exploding', async () => {
    hasRequiredWidgetParameters.mockReturnValue(true);
    widgetApi.hasInitialCapabilities.mockReturnValue(true);

    render(
      <MuiWidgetApiProvider widgetApiPromise={widgetApiPromise}>
        <div>Children</div>
      </MuiWidgetApiProvider>,
    );

    expect(await screen.findByText('Children')).toBeInTheDocument();
  });
});

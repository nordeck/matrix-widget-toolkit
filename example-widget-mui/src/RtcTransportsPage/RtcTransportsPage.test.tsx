/*
 * Copyright 2026 Nordeck IT + Consulting GmbH
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

import { WidgetApiMockProvider } from '@matrix-widget-toolkit/react';
import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { MatrixCapabilities } from 'matrix-widget-api';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RtcTransportsPage } from './RtcTransportsPage';

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  wrapper = ({ children }: PropsWithChildren) => (
    <WidgetApiMockProvider value={widgetApi}>
      <MemoryRouter>{children}</MemoryRouter>
    </WidgetApiMockProvider>
  );
});

describe('RtcTransportsPage', () => {
  it('should render without exploding', async () => {
    render(<RtcTransportsPage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /rtc transports/i }),
    ).resolves.toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<RtcTransportsPage />, { wrapper });

    await expect(
      screen.findByRole('heading', { name: /rtc transports/i }),
    ).resolves.toBeInTheDocument();

    expect(await axe.run(container)).toHaveNoViolations();
  });

  it('should request the capabilities', async () => {
    render(<RtcTransportsPage />, { wrapper });

    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      MatrixCapabilities.MSC4515RtcTransports,
    ]);
  });

  it('should show rtc transports', async () => {
    widgetApi.getRtcTransports.mockResolvedValue([
      {
        type: 'livekit',
        livekit_service_url: 'https://livekit-jwt.example.com',
      },
    ]);

    render(<RtcTransportsPage />, { wrapper });

    await expect(
      screen.findByText(/rtc transports discovered/i),
    ).resolves.toBeInTheDocument();
    expect(
      screen.getByText(
        `[ { "type": "livekit", "livekit_service_url": "https://livekit-jwt.example.com" } ]`,
      ),
    ).toBeInTheDocument();
  });

  it('should show an error if unexpected error happens during rtc transports discovery', async () => {
    widgetApi.getRtcTransports.mockRejectedValue(new Error('Unexpected'));

    render(<RtcTransportsPage />, { wrapper });

    await expect(
      screen.findByText(/error: unexpected/i),
    ).resolves.toBeInTheDocument();
  });
});

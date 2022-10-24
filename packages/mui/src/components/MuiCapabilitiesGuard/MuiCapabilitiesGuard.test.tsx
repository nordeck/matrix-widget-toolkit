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

import { WidgetApi } from '@matrix-widget-toolkit/api';
import { WidgetApiMockProvider } from '@matrix-widget-toolkit/react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ReactNode } from 'react';
import { MuiCapabilitiesGuard } from './MuiCapabilitiesGuard';

describe('<MuiCapabilitiesGuard>', () => {
  let widgetApi: jest.Mocked<WidgetApi>;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <WidgetApiMockProvider value={widgetApi}>{children}</WidgetApiMockProvider>
  );

  beforeEach(() => {
    widgetApi = {
      widgetId: 'widget-id',
      widgetParameters: { isOpenedByClient: true },
      requestCapabilities: jest.fn(),
      hasCapabilities: jest.fn(),
    } as Partial<jest.Mocked<WidgetApi>> as jest.Mocked<WidgetApi>;
  });

  it('should render without exploding', async () => {
    widgetApi.requestCapabilities.mockRejectedValue(new Error());

    render(
      <MuiCapabilitiesGuard capabilities={['com.example.my-capability']}>
        <div>Child</div>
      </MuiCapabilitiesGuard>,
      { wrapper }
    );

    expect(await screen.findByText('Missing capabilities')).toBeInTheDocument();
    expect(widgetApi.requestCapabilities).toBeCalledWith([
      'com.example.my-capability',
    ]);
  });

  it('should have no accessibility violations', async () => {
    widgetApi.requestCapabilities.mockRejectedValue(new Error());

    const { container } = render(
      <MuiCapabilitiesGuard capabilities={['com.example.my-capability']}>
        <div>Child</div>
      </MuiCapabilitiesGuard>,
      { wrapper }
    );

    expect(await screen.findByText('Missing capabilities')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

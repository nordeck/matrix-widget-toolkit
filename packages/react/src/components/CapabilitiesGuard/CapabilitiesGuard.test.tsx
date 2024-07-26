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
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ComponentType,
  DispatchWithoutAction,
  PropsWithChildren,
  ReactNode,
} from 'react';
import { WidgetApiMockProvider } from '../WidgetApiProvider';
import { CapabilitiesGuard } from './CapabilitiesGuard';

describe('<CapabilitiesGuard>', () => {
  let widgetApi: jest.Mocked<WidgetApi>;
  let CapabilitiesGuardWithUi: ComponentType<PropsWithChildren<{}>>;
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

    const LoadingComponent = () => <div>Loading</div>;
    const MissingCapabilitiesComponent = ({
      onRetry,
    }: {
      onRetry: DispatchWithoutAction;
    }) => (
      <div>
        Missing capabilities
        <button onClick={onRetry}>Request capabilities</button>
      </div>
    );

    CapabilitiesGuardWithUi = ({ children }) => (
      <CapabilitiesGuard
        loadingComponent={LoadingComponent}
        missingCapabilitiesComponent={MissingCapabilitiesComponent}
        capabilities={['com.example.my-capability']}
      >
        {children}
      </CapabilitiesGuard>
    );
  });

  it('should render children if capabilities are allowed', async () => {
    widgetApi.requestCapabilities.mockResolvedValue();

    render(
      <CapabilitiesGuardWithUi>
        <div>Child</div>
      </CapabilitiesGuardWithUi>,
      { wrapper },
    );

    expect(await screen.findByText('Child')).toBeInTheDocument();
    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      'com.example.my-capability',
    ]);
  });

  it('should render a loading screen while the capabilities are requested', async () => {
    widgetApi.requestCapabilities.mockReturnValue(
      new Promise(() => {
        // Never resolves
      }),
    );

    render(
      <CapabilitiesGuardWithUi>
        <div>Child</div>
      </CapabilitiesGuardWithUi>,
      { wrapper },
    );

    expect(await screen.findByText('Loading')).toBeInTheDocument();
    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      'com.example.my-capability',
    ]);
  });

  it('should show an error message if capabilities were rejected', async () => {
    widgetApi.requestCapabilities.mockRejectedValue(new Error());

    render(
      <CapabilitiesGuardWithUi>
        <div>Child</div>
      </CapabilitiesGuardWithUi>,
      { wrapper },
    );

    expect(await screen.findByText('Missing capabilities')).toBeInTheDocument();
    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      'com.example.my-capability',
    ]);

    expect(widgetApi.requestCapabilities).toHaveBeenCalledTimes(1);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Request capabilities' }),
    );

    expect(widgetApi.requestCapabilities).toHaveBeenCalledTimes(2);
  });
});

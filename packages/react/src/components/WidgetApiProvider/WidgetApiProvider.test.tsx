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
  hasWidgetParameters as hasWidgetParametersMocked,
  WidgetApi,
  WidgetParameter,
  WidgetRegistration,
} from '@matrix-widget-toolkit/api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ComponentType,
  DispatchWithoutAction,
  PropsWithChildren,
  useEffect,
} from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  Mocked,
  vi,
} from 'vitest';
import { useWidgetApi } from './context';
import { WidgetApiProvider } from './WidgetApiProvider';

vi.mock('@matrix-widget-toolkit/api');

const hasWidgetParameters = vi.mocked(hasWidgetParametersMocked);
const extractWidgetParameters = vi.mocked(extractWidgetParametersMocked);

describe('WidgetApiProvider', () => {
  let widgetApi: Mocked<WidgetApi>;
  let widgetApiPromise: Promise<WidgetApi>;
  let WidgetApiProviderWithUi: ComponentType<
    PropsWithChildren<{
      widgetApiPromise: Promise<WidgetApi>;
      widgetRegistration?: WidgetRegistration | undefined;
    }>
  >;
  const oldConsoleError = console.error;

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

    const ChildErrorComponent = () => <div>Child Error</div>;
    const LoadingViewComponent = () => <div>Loading</div>;
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
    const MissingParametersErrorComponent = () => (
      <div>Wrong widget registration</div>
    );
    const MobileClientErrorComponent = () => (
      <div>Mobile clients are not supported</div>
    );
    const OutsideClientErrorComponent = () => <div>Only runs as a widget</div>;

    WidgetApiProviderWithUi = ({
      widgetApiPromise,
      widgetRegistration,
      children,
    }: PropsWithChildren<{
      widgetApiPromise: Promise<WidgetApi>;
      widgetRegistration?: WidgetRegistration | undefined;
    }>) => (
      <WidgetApiProvider
        childErrorComponent={ChildErrorComponent}
        loadingViewComponent={LoadingViewComponent}
        missingCapabilitiesComponent={MissingCapabilitiesComponent}
        missingParametersErrorComponent={MissingParametersErrorComponent}
        mobileClientErrorComponent={MobileClientErrorComponent}
        outsideClientErrorComponent={OutsideClientErrorComponent}
        widgetApiPromise={widgetApiPromise}
        widgetRegistration={widgetRegistration}
      >
        {children}
      </WidgetApiProvider>
    );

    // Hide errors in the console produced by the error boundary
    console.error = () => {};
  });

  afterEach(() => {
    console.error = oldConsoleError;
  });

  it('should show loading screen if widget API is not initalied yet', async () => {
    widgetApiPromise = new Promise(() => {
      /* Never resolves */
    });

    render(
      <WidgetApiProviderWithUi widgetApiPromise={widgetApiPromise}>
        <div>Children</div>
      </WidgetApiProviderWithUi>,
    );

    expect(await screen.findByText('Loading')).toBeInTheDocument();
  });

  it('should render children after widget API is initalized', async () => {
    hasWidgetParameters.mockReturnValue(true);
    widgetApi.hasInitialCapabilities.mockReturnValue(true);

    render(
      <WidgetApiProviderWithUi widgetApiPromise={widgetApiPromise}>
        <div>Children</div>
      </WidgetApiProviderWithUi>,
    );

    expect(await screen.findByText('Children')).toBeInTheDocument();
  });

  it('should provide widget API in context to children', async () => {
    hasWidgetParameters.mockReturnValue(true);
    widgetApi.hasInitialCapabilities.mockReturnValue(true);

    const Child = () => {
      const api = useWidgetApi();

      useEffect(() => {
        api.sendRoomEvent('com.example.event', { some: 'data' });
      }, [api]);

      return <div>Child</div>;
    };

    render(
      <WidgetApiProviderWithUi widgetApiPromise={widgetApiPromise}>
        <Child />
      </WidgetApiProviderWithUi>,
    );

    expect(await screen.findByText('Child')).toBeInTheDocument();
    expect(widgetApi.sendRoomEvent).toHaveBeenCalledWith('com.example.event', {
      some: 'data',
    });
  });

  it('should show an error message if one of the initial capabilities is denied', async () => {
    hasWidgetParameters.mockReturnValue(true);
    widgetApi.hasInitialCapabilities.mockReturnValue(false);
    widgetApi.rerequestInitialCapabilities.mockResolvedValue(undefined);

    render(
      <WidgetApiProviderWithUi widgetApiPromise={widgetApiPromise}>
        <div>Children</div>
      </WidgetApiProviderWithUi>,
    );

    expect(await screen.findByText('Missing capabilities')).toBeInTheDocument();
    expect(widgetApi.hasInitialCapabilities).toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Request capabilities' }),
    );

    expect(widgetApi.rerequestInitialCapabilities).toHaveBeenCalled();

    expect(screen.getByText('Children')).toBeInTheDocument();
  });

  it('should show an error if opened outside of a Matrix client', async () => {
    extractWidgetParameters.mockReturnValue({ isOpenedByClient: false });

    widgetApiPromise = Promise.reject('Missing parameter');

    render(
      <WidgetApiProviderWithUi widgetApiPromise={widgetApiPromise}>
        <div>Children</div>
      </WidgetApiProviderWithUi>,
    );

    expect(
      await screen.findByText('Only runs as a widget'),
    ).toBeInTheDocument();
  });

  it('should show an error if opened inside a mobile Matrix client', async () => {
    widgetApiPromise = Promise.reject('Missing parameter');

    render(
      <WidgetApiProviderWithUi widgetApiPromise={widgetApiPromise}>
        <div>Children</div>
      </WidgetApiProviderWithUi>,
    );

    expect(
      await screen.findByText('Mobile clients are not supported'),
    ).toBeInTheDocument();
  });

  it('should show an error if some of the required widget parameters are missing', async () => {
    hasWidgetParameters.mockReturnValue(false);
    widgetApi.hasInitialCapabilities.mockReturnValue(true);

    render(
      <WidgetApiProviderWithUi widgetApiPromise={widgetApiPromise}>
        <div>Children</div>
      </WidgetApiProviderWithUi>,
    );

    expect(
      await screen.findByText('Wrong widget registration'),
    ).toBeInTheDocument();
  });

  it('should show an error if a specific required widget parameter is missing', async () => {
    hasWidgetParameters.mockReturnValue(true);
    widgetApi.hasInitialCapabilities.mockReturnValue(true);

    render(
      <WidgetApiProviderWithUi
        widgetApiPromise={widgetApiPromise}
        widgetRegistration={{ requiredParameters: [WidgetParameter.DeviceId] }}
      >
        <div>Children</div>
      </WidgetApiProviderWithUi>,
    );

    expect(
      await screen.findByText('Wrong widget registration'),
    ).toBeInTheDocument();
  });

  it('should show an error if a child component fails to render', async () => {
    hasWidgetParameters.mockReturnValue(true);
    widgetApi.hasInitialCapabilities.mockReturnValue(true);

    const Child = () => {
      throw Error('Test');
    };

    render(
      <WidgetApiProviderWithUi widgetApiPromise={widgetApiPromise}>
        <Child />
      </WidgetApiProviderWithUi>,
    );

    expect(await screen.findByText('Child Error')).toBeInTheDocument();
  });
});

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
  extractWidgetParameters,
  hasRequiredWidgetParameters,
  WidgetApi,
  WidgetRegistration,
} from '@matrix-widget-toolkit/api';
import {
  ComponentType,
  DispatchWithoutAction,
  PropsWithChildren,
  ReactElement,
  useMemo,
  useState,
} from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useAsync, useAsyncFn } from 'react-use';
import { WidgetApiContext } from './context';

/**
 * Props for the {@link (WidgetApiProvider:function)} component.
 */
export type WidgetApiProviderProps = PropsWithChildren<{
  /**
   * Configuration to set during Widget registration.
   */
  widgetRegistration?: WidgetRegistration;
  /**
   * Result from a call to `WidgetApiImpl.create`.
   */
  widgetApiPromise: Promise<WidgetApi>;
  /**
   * Component to display while the widget API communication is established or
   * while capabilities are evaluated or requested from the user.
   */
  loadingViewComponent: ComponentType;
  /**
   * Component to display if the widget is opened in an unsupported mobile
   * client.
   */
  mobileClientErrorComponent: ComponentType;
  /**
   * Component to display if the widget is opened outside a Matrix client.
   */
  outsideClientErrorComponent: ComponentType;
  /**
   * Component to display when a child component fails to render.
   */
  childErrorComponent: ComponentType<FallbackProps>;
  /**
   * Component to display if the required capabilities are missing. The
   * `onRetry` callback can be used to re-request them from the user.
   */
  missingCapabilitiesComponent: ComponentType<{
    onRetry: DispatchWithoutAction;
  }>;
  /**
   * Component to display when the widget is not properly configured in the
   * room. Takes the expected `widgetRegistration` as a parameter.
   */
  missingParametersErrorComponent: ComponentType<{
    widgetRegistration?: WidgetRegistration;
  }>;
}>;

/**
 * Provides the `WidgetApi` in the React context once it's fully
 * initialized without errors.
 * Use {@link useWidgetApi} to access it.
 * @param param0 - {@link WidgetApiProviderProps}
 */
export function WidgetApiProvider({
  children,
  widgetApiPromise,
  widgetRegistration,
  loadingViewComponent: LoadingViewComponent,
  mobileClientErrorComponent: MobileClientErrorComponent,
  outsideClientErrorComponent: OutsideClientErrorComponent,
  childErrorComponent: ChildErrorComponent,
  missingCapabilitiesComponent: MissingCapabilitiesComponent,
  missingParametersErrorComponent: MissingParametersErrorComponent,
}: WidgetApiProviderProps): ReactElement {
  const { isOpenedByClient } = useMemo(() => extractWidgetParameters(), []);
  const [hasInitalCapabilitiesGranted, setInitialCapabilitiesGranted] =
    useState<boolean | undefined>();

  const [, rerequestInitialCapabilities] = useAsyncFn(
    async (widgetApi: WidgetApi) => {
      try {
        await widgetApi.rerequestInitialCapabilities();
        setInitialCapabilitiesGranted(true);
      } catch (_) {
        setInitialCapabilitiesGranted(false);
      }
    },
    []
  );

  const {
    value: widgetApi,
    error,
    loading,
  } = useAsync(async () => {
    const widgetApi = await widgetApiPromise;

    setInitialCapabilitiesGranted(widgetApi.hasInitialCapabilities());

    return widgetApi;
  }, [widgetApiPromise]);

  if (loading) {
    return <LoadingViewComponent />;
  }

  if (error || !widgetApi) {
    if (isOpenedByClient) {
      return <MobileClientErrorComponent />;
    } else {
      return <OutsideClientErrorComponent />;
    }
  }

  if (!hasInitalCapabilitiesGranted) {
    return (
      <MissingCapabilitiesComponent
        onRetry={() => rerequestInitialCapabilities(widgetApi)}
      />
    );
  }

  const hasParameters = hasRequiredWidgetParameters(widgetApi);

  return (
    <WidgetApiContext.Provider value={widgetApi}>
      {hasParameters ? (
        <ErrorBoundary FallbackComponent={ChildErrorComponent}>
          {children}
        </ErrorBoundary>
      ) : (
        <MissingParametersErrorComponent
          widgetRegistration={widgetRegistration}
        />
      )}
    </WidgetApiContext.Provider>
  );
}

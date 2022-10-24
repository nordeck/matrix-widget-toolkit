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

import { WidgetApi, WidgetRegistration } from '@matrix-widget-toolkit/api';
import { WidgetApiProvider } from '@matrix-widget-toolkit/react';
import { PropsWithChildren, ReactElement } from 'react';
import { LoadingView } from '../LoadingView';
import { MissingCapabilitiesError } from '../MissingCapabilitiesError';
import { ChildError } from './ChildError';
import { MissingParametersError } from './MissingParametersError';
import { MobileClientError } from './MobileClientError';
import { OutsideClientError } from './OutsideClientError';

// TODO: Consider providing a fallback component for cases where we don't want
// to show an error if not run as a widget.

// TODO: Provide a way to override the setup experience

/**
 * Props for the {@link (SemanticUiWidgetApiProvider:function)} component.
 */
export type SemanticUiWidgetApiProviderProps = PropsWithChildren<{
  /**
   * Configuration to set during Widget registration.
   */
  widgetRegistration?: WidgetRegistration;
  /**
   * Result from a call to `WidgetApiImpl.create`.
   */
  widgetApiPromise: Promise<WidgetApi>;
}>;

/**
 * Provides the `WidgetApi` in the React context once it's fully
 * initialized without errors.
 * Use `useWidgetApi` to access it.
 * @param param0 - {@link SemanticUiWidgetApiProviderProps}
 */
export function SemanticUiWidgetApiProvider({
  widgetRegistration,
  widgetApiPromise,
  children,
}: SemanticUiWidgetApiProviderProps): ReactElement {
  return (
    <WidgetApiProvider
      widgetApiPromise={widgetApiPromise}
      widgetRegistration={widgetRegistration}
      loadingViewComponent={LoadingView}
      mobileClientErrorComponent={MobileClientError}
      childErrorComponent={ChildError}
      outsideClientErrorComponent={OutsideClientError}
      missingCapabilitiesComponent={MissingCapabilitiesError}
      missingParametersErrorComponent={MissingParametersError}
    >
      {children}
    </WidgetApiProvider>
  );
}

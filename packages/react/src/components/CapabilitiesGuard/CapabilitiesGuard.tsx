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

import { Capability, WidgetEventCapability } from 'matrix-widget-api';
import {
  ComponentType,
  DispatchWithoutAction,
  PropsWithChildren,
  ReactElement,
} from 'react';
import { useAsyncRetry } from 'react-use';
import { useWidgetApi } from '../WidgetApiProvider';

/**
 * Props for the {@link CapabilitiesGuard} component.
 */
export type CapabilitiesGuardProps = PropsWithChildren<{
  /**
   * Required capabilities to display the `children`.
   */
  capabilities: Array<WidgetEventCapability | Capability>;
  /**
   * Component to display if the required capabilities are missing. The
   * `onRetry` callback can be used to re-request them from the user.
   */
  missingCapabilitiesComponent: ComponentType<{
    onRetry: DispatchWithoutAction;
  }>;
  /**
   * Component to display while the capabilities are evaluated or requested from
   * the user.
   */
  loadingComponent: ComponentType;
}>;

/**
 * A guard that ask the user for capabilities and only shows the `children`
 * if all capabilities were accepted.
 * If capabilities are denined, a message and a button to retry is displayed
 * instead.
 * @param param0 - {@link CapabilitiesGuardProps}
 */
export function CapabilitiesGuard({
  capabilities,
  children,
  missingCapabilitiesComponent: MissingCapabilitiesComponent,
  loadingComponent: LoadingComponent,
}: CapabilitiesGuardProps): ReactElement {
  const widgetApi = useWidgetApi();

  const {
    loading,
    error,
    retry: requestCapabilities,
  } = useAsyncRetry(
    () => widgetApi.requestCapabilities(capabilities),
    [widgetApi, capabilities]
  );

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <MissingCapabilitiesComponent onRetry={requestCapabilities} />;
  }

  return <>{children}</>;
}

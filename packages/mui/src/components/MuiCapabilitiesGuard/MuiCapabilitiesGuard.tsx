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

import { CapabilitiesGuard } from '@matrix-widget-toolkit/react';
import { Capability, WidgetEventCapability } from 'matrix-widget-api';
import { PropsWithChildren, ReactElement } from 'react';
import { LoadingView } from '../LoadingView';
import { MissingCapabilitiesError } from '../MissingCapabilitiesError';

/**
 * Props for the {@link MuiCapabilitiesGuard} component.
 */
export type MuiCapabilitiesGuardProps = PropsWithChildren<{
  /**
   * Required capabilities to display the `children`.
   */
  capabilities: Array<WidgetEventCapability | Capability>;
}>;

/**
 * A guard that ask the user for capabilities and only shows the `children`
 * if all capabilities were accepted.
 * If capabilities are denied, a message and a button to retry is displayed
 * instead.
 * @param param0 - {@link MuiCapabilitiesGuardProps}
 */
export function MuiCapabilitiesGuard({
  capabilities,
  children,
}: MuiCapabilitiesGuardProps): ReactElement {
  return (
    <CapabilitiesGuard
      capabilities={capabilities}
      loadingComponent={LoadingView}
      missingCapabilitiesComponent={MissingCapabilitiesError}
    >
      {children}
    </CapabilitiesGuard>
  );
}

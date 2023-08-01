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
import { createContext, useContext } from 'react';

export const WidgetApiContext = createContext<WidgetApi | undefined>(undefined);

/**
 * Hook for accessing the widget API.
 *
 * @remarks Can only be called inside a `WidgetApiProvider`
 *          (or WidgetApiMockProvider in tests).
 *
 * @returns A fully initialized widget API.
 */
export const useWidgetApi = (): WidgetApi => {
  const context = useContext(WidgetApiContext);
  if (context === undefined) {
    throw new Error(
      'useWidgetApi must be used within a WidgetApiProvider (or WidgetApiMockProvider in tests)',
    );
  }
  return context;
};

/**
 * Provides a custom instance of the `WidgetApi` to the context.
 *
 * @remarks Should only be used in tests.
 */
export const WidgetApiMockProvider = WidgetApiContext.Provider;

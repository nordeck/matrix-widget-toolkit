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

import '@fontsource/lato/400-italic.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700-italic.css';
import '@fontsource/lato/700.css';
import { ThemeSelectionProvider } from '@matrix-widget-toolkit/react';
import { PropsWithChildren, ReactElement } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

/**
 * Props for the {@link SemanticUiThemeProvider} component.
 */
// {} usage is safe here, see https://github.com/typescript-eslint/typescript-eslint/issues/2063#issuecomment-675156492
// eslint-disable-next-line @typescript-eslint/ban-types
export type SemanticUiThemeProviderProps = PropsWithChildren<{}>;

/**
 * Provide a semantic UI based theme to the child components.
 * @param param0 - {@link SemanticUiThemeProviderProps}
 */
export function SemanticUiThemeProvider({
  children,
}: SemanticUiThemeProviderProps): ReactElement {
  return (
    <ThemeSelectionProvider>
      <ThemeSwitcher />
      {children}
    </ThemeSelectionProvider>
  );
}

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
  extractWidgetApiParameters,
  extractWidgetParameters,
  parseWidgetId,
} from '@matrix-widget-toolkit/api';
import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

/**
 * Themes with different color schemes, either `light` or `dark`.
 */
export type Theme = 'light' | 'dark' | string;

/**
 * Return value of the {@link useThemeSelection} hook.
 */
export type ThemeSelectionContextType = {
  /**
   * The current color scheme.
   */
  theme: Theme;
  /**
   * Whether the widget is displayed in a modal.
   *
   * @remarks Modals have different background colors which the theme needs to
   * take into account.
   */
  isModal: boolean;
  /**
   * Select the current color scheme.
   *
   * @param theme - The new color scheme.
   */
  setTheme: (theme: Theme) => void;
};

export const ThemeSelectionContext = createContext<
  ThemeSelectionContextType | undefined
>(undefined);

/**
 * Hook for accessing the current theme selection.
 * @returns The current theme selection.
 */
export const useThemeSelection = (): ThemeSelectionContextType => {
  const context = useContext(ThemeSelectionContext);

  if (context === undefined) {
    throw new Error(
      'useThemeSelection must be used within a ThemeSelectionProvider',
    );
  }

  return context;
};

/**
 * Props for the {@link ThemeSelectionProvider} component.
 */
export type ThemeSelectionProviderProps = PropsWithChildren<{}>;

/**
 * Provides the current theme selection to child components.
 * Use the {@link useThemeSelection} hook to access it.
 * @param param0 - {@link ThemeSelectionProviderProps}
 */
export function ThemeSelectionProvider({
  children,
}: ThemeSelectionProviderProps): ReactElement {
  const [{ theme, isModal }, setState] = useState<{
    theme: Theme;
    isModal: boolean;
  }>(() => {
    let widgetId = '';
    try {
      ({ widgetId } = extractWidgetApiParameters());
    } catch {
      // ignore
    }

    const { isModal } = parseWidgetId(widgetId);
    const { theme } = extractWidgetParameters();

    if (theme) {
      return { theme, isModal };
    }

    const prefersColorSchemeDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return { theme: prefersColorSchemeDark ? 'dark' : 'light', isModal };
  });

  const setTheme = useCallback((theme: Theme) => {
    setState((old) => ({ ...old, theme }));
  }, []);

  const context = useMemo(
    () => ({
      theme,
      isModal,
      setTheme,
    }),
    [isModal, setTheme, theme],
  );

  return (
    <ThemeSelectionContext.Provider value={context}>
      {children}
    </ThemeSelectionContext.Provider>
  );
}

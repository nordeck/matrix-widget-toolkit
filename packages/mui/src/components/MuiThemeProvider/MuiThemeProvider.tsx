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

import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import {
  ThemeSelectionProvider,
  useThemeSelection,
} from '@matrix-widget-toolkit/react';
import {
  createTheme,
  CssBaseline,
  ThemeOptions,
  ThemeProvider,
} from '@mui/material';
import { deDE, enUS } from '@mui/material/locale';
import { deepmerge } from '@mui/utils';
import i18n from 'i18next';
import {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { EmotionCacheProvider } from './EmotionCacheProvider';
import { getEnvironment } from './environment';
import {
  baseTheme,
  darkTheme,
  lightHighContrastTheme,
  lightTheme,
} from './theme';

/**
 * Props for the {@link MuiThemeProvider} component.
 */
// {} usage is safe here, see https://github.com/typescript-eslint/typescript-eslint/issues/2063#issuecomment-675156492
// eslint-disable-next-line @typescript-eslint/ban-types
export type MuiThemeProviderProps = PropsWithChildren<{}>;

/**
 * Provide a semantic UI based theme to the child components.
 * @param param0 - {@link MuiThemeProviderProps}
 */
export function MuiThemeProvider({
  children,
}: MuiThemeProviderProps): ReactElement {
  return (
    <EmotionCacheProvider>
      <ThemeSelectionProvider>
        <ElementMuiThemeProvider>{children}</ElementMuiThemeProvider>
      </ThemeSelectionProvider>
    </EmotionCacheProvider>
  );
}

export function chooseTheme(theme: string): ThemeOptions {
  const isDark = theme === 'dark';
  const isForceHighContrast = !!getEnvironment(
    'REACT_APP_FORCE_HIGH_CONTRAST_THEME'
  );
  const isHighContrast = isForceHighContrast || theme === 'light-high-contrast';

  if (isDark) {
    return darkTheme;
  } else if (isHighContrast) {
    return lightHighContrastTheme;
  } else {
    return lightTheme;
  }
}

function ElementMuiThemeProvider({ children }: PropsWithChildren<{}>) {
  const { theme } = useThemeSelection();
  const [locale, setLocale] = useState(i18n.languages?.[0]);

  useEffect(() => {
    const callback = () => setLocale(i18n.languages[0]);

    i18n.on('languageChanged', callback);

    return () => i18n.off('languageChanged', callback);
  }, []);

  const muiTheme = useMemo(() => {
    const themeOptions = chooseTheme(theme);
    const localeOptions = locale === 'de' ? deDE : enUS;

    return createTheme(deepmerge(baseTheme, themeOptions), localeOptions);
  }, [locale, theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />

      {children}
    </ThemeProvider>
  );
}

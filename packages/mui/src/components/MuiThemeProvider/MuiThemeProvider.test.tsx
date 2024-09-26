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

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MuiThemeProvider, chooseTheme } from './MuiThemeProvider';
import { getEnvironment as getEnvironmentMocked } from './environment';
import { darkTheme, lightHighContrastTheme, lightTheme } from './theme';

vi.mock('./environment', async () => ({
  ...(await vi.importActual<typeof import('./environment')>('./environment')),
  getEnvironment: vi
    .fn()
    .mockImplementation(
      (await vi.importActual<typeof import('./environment')>('./environment'))
        .getEnvironment,
    ),
}));

const getEnvironment = vi.mocked(getEnvironmentMocked);

describe('<MuiThemeProvider/>', () => {
  it('should render without exploding', () => {
    render(
      <MuiThemeProvider>
        <p>children</p>
      </MuiThemeProvider>,
    );

    expect(screen.getByText(/children/)).toBeInTheDocument();
  });
});

describe('chooseTheme', () => {
  it.each`
    themeName                | theme
    ${'light'}               | ${lightTheme}
    ${'dark'}                | ${darkTheme}
    ${'light-high-contrast'} | ${lightHighContrastTheme}
  `(
    'should return matching theme for $themeName theme',
    ({ themeName, theme }) => {
      expect(chooseTheme(themeName)).toBe(theme);
    },
  );

  it('should override light theme with high contrast theme via environment', () => {
    getEnvironment.mockImplementation((name, defaultValue) => {
      return name === 'REACT_APP_FORCE_HIGH_CONTRAST_THEME'
        ? 'true'
        : defaultValue;
    });

    expect(chooseTheme('light')).toBe(lightHighContrastTheme);
    expect(chooseTheme('dark')).toBe(darkTheme);
  });
});

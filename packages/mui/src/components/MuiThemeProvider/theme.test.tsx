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
  createTheme,
  darken,
  decomposeColor,
  getContrastRatio,
  hexToRgb,
  lighten,
  recomposeColor,
  SimplePaletteColorOptions,
  Theme,
  ThemeOptions,
  TypeBackground,
  TypeText,
} from '@mui/material';
import { deepmerge } from '@mui/utils';
import { baseTheme, lightHighContrastTheme } from './theme';

type TextColor = keyof TypeText;
type PaletteColors =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'success'
  | 'info';
type BackgroundColors = keyof TypeBackground;
type ColorLevels = keyof SimplePaletteColorOptions;

describe.each`
  themeOptions              | name                     | highContrast
  ${lightHighContrastTheme} | ${'light high contrast'} | ${true}
`(
  // Both light and dark mode are currently not complying to color contrast:
  //
  // ${lightTheme}             | ${'light'}               | ${false}
  // ${darkTheme}              | ${'dark'}                | ${false}
  '$name',
  ({
    themeOptions,
    highContrast,
  }: {
    themeOptions: ThemeOptions;
    highContrast: boolean;
  }) => {
    const regularText = highContrast ? { aaa: true, aa: true } : { aa: true };
    const largeText = highContrast ? { aaa: true, aa: true } : { aa: true };
    const uiComponent = { aa: true };
    let theme: Theme;

    beforeEach(() => {
      theme = createTheme(deepmerge(baseTheme, themeOptions));
    });

    it.each`
      text           | background
      ${'primary'}   | ${'default'}
      ${'primary'}   | ${'paper'}
      ${'secondary'} | ${'default'}
      ${'secondary'} | ${'paper'}
    `(
      // It is not required that incidental text (e.g. disabled UI) meets the
      // contrast requirements:
      // ${'disabled'}  | ${'default'}
      // ${'disabled'}  | ${'paper'}
      '$text text should have a sufficent contrast on the $background background',
      ({
        text,
        background,
      }: {
        text: TextColor;
        background: BackgroundColors;
      }) => {
        expect(
          wcagContrast(
            theme.palette.text[text],
            theme.palette.background[background]
          )
        ).toMatchObject({ regularText, largeText });
      }
    );

    it.each`
      palette      | background
      ${'primary'} | ${'main'}
      ${'primary'} | ${'dark'}
      ${'error'}   | ${'main'}
      ${'error'}   | ${'dark'}
    `(
      // Info, warning, and success color is currently not in use and don't meet
      // the contrast requirements:
      // ${'warning'} | ${'main'}
      // ${'warning'} | ${'dark'}
      // ${'success'} | ${'main'}
      // ${'success'} | ${'dark'}
      // ${'info'}    | ${'main'}
      // ${'info'}    | ${'dark'}
      'the text contrast color of primary buttons with color $palette should have a sufficent contrast on background $palette $background',
      ({
        palette,
        background,
      }: {
        palette: PaletteColors;
        background: ColorLevels;
      }) => {
        expect(
          wcagContrast(
            theme.palette[palette].contrastText,
            theme.palette[palette][background]
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      palette      | background
      ${'primary'} | ${'paper'}
      ${'primary'} | ${'default'}
      ${'error'}   | ${'paper'}
      ${'error'}   | ${'default'}
    `(
      // Info, warning, and success color is currently not in use and don't meet
      // the contrast requirements:
      // ${'warning'} | ${'main'}
      // ${'warning'} | ${'dark'}
      // ${'success'} | ${'main'}
      // ${'success'} | ${'dark'}
      // ${'info'}    | ${'main'}
      // ${'info'}    | ${'dark'}
      'the text contrast color of secondary buttons with color $palette should have a sufficent contrast on background $background',
      ({
        palette,
        background,
      }: {
        palette: PaletteColors;
        background: BackgroundColors;
      }) => {
        expect(
          wcagContrast(
            theme.palette[palette].main,
            theme.palette.background[background]
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      palette      | background
      ${'primary'} | ${'paper'}
      ${'primary'} | ${'default'}
      ${'error'}   | ${'paper'}
      ${'error'}   | ${'default'}
    `(
      // Info, warning, and success color is currently not in use and don't meet
      // the contrast requirements:
      // ${'warning'} | ${'main'}
      // ${'warning'} | ${'dark'}
      // ${'success'} | ${'main'}
      // ${'success'} | ${'dark'}
      // ${'info'}    | ${'main'}
      // ${'info'}    | ${'dark'}
      'the text contrast color of secondary buttons with color $palette should have a sufficent contrast on background $background on hover',
      ({
        palette,
        background,
      }: {
        palette: PaletteColors;
        background: BackgroundColors;
      }) => {
        expect(
          wcagContrast(
            theme.palette[palette].main,
            alphaBlend(
              theme.palette[palette].main,
              theme.palette.background[background],
              theme.palette.action.hoverOpacity
            )
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      palette      | background
      ${'primary'} | ${'paper'}
      ${'primary'} | ${'default'}
      ${'error'}   | ${'paper'}
      ${'error'}   | ${'default'}
    `(
      // Info, warning, and success color is currently not in use and don't meet
      // the contrast requirements:
      // ${'warning'} | ${'main'}
      // ${'warning'} | ${'dark'}
      // ${'success'} | ${'main'}
      // ${'success'} | ${'dark'}
      // ${'info'}    | ${'main'}
      // ${'info'}    | ${'dark'}
      'the text contrast color of text only buttons with color $palette should have a sufficent contrast on background $background on hover',
      ({
        palette,
        background,
      }: {
        palette: PaletteColors;
        background: BackgroundColors;
      }) => {
        expect(
          wcagContrast(
            theme.palette[palette].main,
            alphaBlend(
              theme.palette[palette].main,
              theme.palette.background[background],
              theme.palette.action.hoverOpacity
            )
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      palette      | background
      ${'error'}   | ${'paper'}
      ${'error'}   | ${'default'}
      ${'warning'} | ${'paper'}
      ${'warning'} | ${'default'}
      ${'success'} | ${'paper'}
      ${'success'} | ${'default'}
      ${'info'}    | ${'paper'}
      ${'info'}    | ${'default'}
    `(
      'the icon color of alerts with color $palette should have a sufficent contrast on background $background',
      ({
        palette,
        background,
      }: {
        palette: PaletteColors;
        background: BackgroundColors;
      }) => {
        const getBackgroundColor =
          theme.palette.mode === 'light' ? lighten : darken;
        const outlined =
          theme.components?.MuiAlert?.defaultProps?.variant === 'outlined';
        const backgroundColor = outlined
          ? theme.palette.background[background]
          : getBackgroundColor(theme.palette[palette].light, 0.6);
        const iconColor =
          theme.palette.mode === 'dark' && !outlined
            ? theme.palette[palette].main
            : theme.palette[palette].light;

        expect(wcagContrast(iconColor, backgroundColor)).toMatchObject({
          uiComponent,
        });
      }
    );

    it.each`
      palette      | background
      ${'error'}   | ${'paper'}
      ${'error'}   | ${'default'}
      ${'warning'} | ${'paper'}
      ${'warning'} | ${'default'}
      ${'success'} | ${'paper'}
      ${'success'} | ${'default'}
      ${'info'}    | ${'paper'}
      ${'info'}    | ${'default'}
    `(
      'the text color of alerts with color $palette should have a sufficent contrast on background $background',
      ({
        palette,
        background,
      }: {
        palette: PaletteColors;
        background: BackgroundColors;
      }) => {
        const getColor = theme.palette.mode === 'light' ? darken : lighten;
        const getBackgroundColor =
          theme.palette.mode === 'light' ? lighten : darken;
        const outlined =
          theme.components?.MuiAlert?.defaultProps?.variant === 'outlined';
        const backgroundColor = outlined
          ? theme.palette.background[background]
          : getBackgroundColor(theme.palette[palette].light, 0.6);

        expect(
          wcagContrast(
            getColor(theme.palette[palette].light, 0.6),
            backgroundColor
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    // TODO: Check switch active and inactive state against background

    // TODO: Check toggle button icons, in inactive state, active state and both on hover.

    it.each`
      background
      ${'default'}
      ${'paper'}
    `(
      'the text color of filled default chips should have a sufficent contrast on $background background',
      ({ background }: { background: BackgroundColors }) => {
        expect(
          wcagContrast(
            theme.palette.text.primary,
            alphaBlend(
              theme.palette.action.selected,
              theme.palette.background[background]
            )
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      palette
      ${'primary'}
      ${'error'}
      ${'warning'}
      ${'success'}
      ${'info'}
    `(
      'the text color of filled $palette chips should have a sufficent contrast',
      ({ palette }: { palette: PaletteColors }) => {
        expect(
          wcagContrast(
            theme.palette[palette].contrastText,
            theme.palette[palette].main
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      background
      ${'default'}
      ${'paper'}
    `(
      'the text color of outlined default chips should have a sufficent contrast on $background background',
      ({ background }: { background: BackgroundColors }) => {
        expect(
          wcagContrast(
            theme.palette.text.primary,
            theme.palette.background[background]
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      palette      | background
      ${'primary'} | ${'default'}
      ${'primary'} | ${'paper'}
      ${'error'}   | ${'default'}
      ${'error'}   | ${'paper'}
      ${'warning'} | ${'default'}
      ${'warning'} | ${'paper'}
      ${'success'} | ${'default'}
      ${'success'} | ${'paper'}
      ${'info'}    | ${'default'}
      ${'info'}    | ${'paper'}
    `(
      'the text color of outlined $palette chips should have a sufficent contrast on $background background',
      ({
        palette,
        background,
      }: {
        palette: PaletteColors;
        background: BackgroundColors;
      }) => {
        expect(
          wcagContrast(
            theme.palette[palette].main,
            theme.palette.background[background]
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    // TODO: Check input placeholder against background

    // TODO: Check input text against background

    // TODO: Check input border against background

    // TODO: Check text of tooltip against background

    it.each`
      background
      ${'default'}
      ${'paper'}
    `(
      'the radio button color should have a sufficent contrast on background $background',
      ({ background }: { background: BackgroundColors }) => {
        expect(
          wcagContrast(
            theme.palette.primary.main,
            theme.palette.background[background]
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      text           | background
      ${'primary'}   | ${'default'}
      ${'primary'}   | ${'paper'}
      ${'secondary'} | ${'default'}
      ${'secondary'} | ${'paper'}
    `(
      // It is not required that incidental text (e.g. disabled UI) meets the
      // contrast requirements:
      // ${'disabled'}  | ${'default'}
      // ${'disabled'}  | ${'paper'}
      '$text text should have a sufficent contrast in a list on hover with the $background background',
      ({
        text,
        background,
      }: {
        text: TextColor;
        background: BackgroundColors;
      }) => {
        expect(
          wcagContrast(
            theme.palette.text[text],
            alphaBlend(
              theme.palette.action.hover,
              theme.palette.background[background]
            )
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      text           | background
      ${'primary'}   | ${'default'}
      ${'primary'}   | ${'paper'}
      ${'secondary'} | ${'default'}
      ${'secondary'} | ${'paper'}
    `(
      // It is not required that incidental text (e.g. disabled UI) meets the
      // contrast requirements:
      // ${'disabled'}  | ${'default'}
      // ${'disabled'}  | ${'paper'}
      '$text text should have a sufficent contrast in a list on selected with the $background background',
      ({
        text,
        background,
      }: {
        text: TextColor;
        background: BackgroundColors;
      }) => {
        expect(
          wcagContrast(
            theme.palette.text[text],
            alphaBlend(
              theme.palette.action.selected,
              theme.palette.background[background]
            )
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );

    it.each`
      text           | background
      ${'primary'}   | ${'default'}
      ${'primary'}   | ${'paper'}
      ${'secondary'} | ${'default'}
      ${'secondary'} | ${'paper'}
    `(
      // It is not required that incidental text (e.g. disabled UI) meets the
      // contrast requirements:
      // ${'disabled'}  | ${'default'}
      // ${'disabled'}  | ${'paper'}
      '$text text should have a sufficent contrast in a list on selected and hover with the $background background',
      ({
        text,
        background,
      }: {
        text: TextColor;
        background: BackgroundColors;
      }) => {
        expect(
          wcagContrast(
            theme.palette.text[text],
            alphaBlend(
              theme.palette.action.hover,
              alphaBlend(
                theme.palette.action.selected,
                theme.palette.background[background]
              )
            )
          )
        ).toMatchObject({ regularText, largeText, uiComponent });
      }
    );
  }
);

/**
 * Blend the foreground color using it alpha value against background. If
 * forceAlpha is provided, it's used instead of the alpha of the foreground
 * color.
 */
function alphaBlend(
  foregroundColor: string,
  backgroundColor: string,
  forceAlpha?: number
): string {
  let foreground = decomposeColor(foregroundColor);
  let background = decomposeColor(backgroundColor);

  if (foreground.type !== 'rgb' && foreground.type !== 'rgba') {
    foreground = decomposeColor(hexToRgb(foregroundColor));
  }

  if (background.type !== 'rgb' && background.type !== 'rgba') {
    background = decomposeColor(hexToRgb(backgroundColor));
  }

  const alpha = forceAlpha ?? foreground.values[3] ?? 1.0;

  for (let i = 0; i < 3; ++i) {
    foreground.values[i] =
      alpha * foreground.values[i] + (1.0 - alpha) * background.values[i];
  }
  foreground.values[3] = 1.0;

  return recomposeColor(foreground);
}

/**
 * Checks the contrast ratio between foreground color and background color and
 * returns in which cases it can be use in a compliant way by the WCAG.
 */
function wcagContrast(
  foregroundColor: string,
  backgroundColor: string
): {
  contrastRatio: number;
  regularText: { aa: boolean; aaa: boolean };
  largeText: { aa: boolean; aaa: boolean };
  uiComponent: { aa: boolean };
} {
  const contrastRatio = getContrastRatio(
    // The contrast ratio doesn't take alpha values for the foreground into
    // account, we have to resolve them first:
    alphaBlend(foregroundColor, backgroundColor),
    backgroundColor
  );

  // See https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
  // and https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced
  // and https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
  return {
    contrastRatio,
    regularText: {
      aa: contrastRatio >= 4.5,
      aaa: contrastRatio >= 7,
    },
    largeText: {
      aa: contrastRatio >= 3.0,
      aaa: contrastRatio >= 4.5,
    },
    uiComponent: {
      aa: contrastRatio >= 3.0,
    },
  };
}

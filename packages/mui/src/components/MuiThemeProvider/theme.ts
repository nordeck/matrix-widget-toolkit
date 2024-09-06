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

import { createTheme, SwitchClasses, Theme, ThemeOptions } from '@mui/material';
import { OverridesStyleRules } from '@mui/material/styles/overrides';
import { getEnvironment } from './environment';

const fontFamily = [
  'Inter',
  'Arial',
  'Helvetica',
  'sans-serif',
  'Twemoji',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Noto Color Emoji"',
].join(',');

const primaryColor = getEnvironment('REACT_APP_PRIMARY_COLOR', '#0dbd8b');
const primaryColorHighContrast = '#075D53';
const errorColor = '#ff5b55';
const errorColorHighContrast = '#AA0904';

function createSwitchStyleOverrides({
  trackColor,
  thumbColor,
}: {
  trackColor: string;
  thumbColor: string;
}): Partial<
  OverridesStyleRules<
    keyof SwitchClasses,
    'MuiSwitch',
    Omit<Theme, 'components'>
  >
> {
  return {
    root: ({ theme }) => ({
      width: 48,
      height: 24,
      padding: 0,
      '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
          transform: 'translateX(16px)',
          color: '#fff',
          '& + .MuiSwitch-track': {
            backgroundColor: theme.palette.primary.main,
            opacity: 1,
            border: 0,
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.5,
          },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
          color: theme.palette.primary.main,
          border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
          color: thumbColor,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
      },
      '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 20,
        height: 20,
      },
      '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: trackColor,
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
          duration: 500,
        }),
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(24px)',
      },
    }),
  };
}

/**
 * Create the default theme to use defaultTheme.typography.pxToRem to calculate
 * font sizes.
 *
 * When using font sizes in our theme, we should always prefer relative units
 * over absolute ones, so that a user can set a different base size in his
 * browser settings.
 */
const defaultTheme = createTheme();

export const baseTheme: ThemeOptions = {
  shape: {
    borderRadius: 8,
  },
  palette: {
    primary: {
      main: primaryColor,
      contrastText: '#ffffff',
    },
    error: {
      main: errorColor,
      contrastText: '#ffffff',
    },
    tonalOffset: 0.025,
  },
  typography: {
    fontFamily,
    fontWeightLight: 400,
    fontWeightMedium: 600,
    fontWeightBold: 600,
    body1: {
      fontSize: defaultTheme.typography.pxToRem(15),
    },
    body2: {
      fontSize: defaultTheme.typography.pxToRem(12),
    },
    button: {
      fontSize: defaultTheme.typography.pxToRem(14),
      textTransform: 'none',
    },
    h1: {
      fontSize: defaultTheme.typography.pxToRem(28),
    },
    h2: {
      fontSize: defaultTheme.typography.pxToRem(24),
    },
    h3: {
      fontSize: defaultTheme.typography.pxToRem(20),
    },
    h4: {
      fontSize: defaultTheme.typography.pxToRem(16),
    },
    h5: {
      fontSize: defaultTheme.typography.pxToRem(15),
      fontWeight: 600,
      textTransform: 'none',
    },
    h6: {
      fontSize: defaultTheme.typography.pxToRem(14),
    },
  },
  components: {
    // Additional text in Element alerts is a bit smaller
    MuiAlert: {
      styleOverrides: {
        message: {
          fontSize: defaultTheme.typography.pxToRem(12),
        },
      },
    },

    // We don't want to use sticky headers for list titles by default
    MuiListSubheader: {
      defaultProps: {
        disableSticky: true,
      },
    },

    // Use smaller text fields by default
    MuiTextField: {
      defaultProps: {
        size: 'small',
        // TODO: color: 'secondary',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },

    // Dialogs have a different padding and font style
    MuiDialog: {
      styleOverrides: {
        root: {
          // Make margin smaller for scroll=body
          '&& .MuiDialog-paperScrollBody': {
            maxWidth: 600,
          },
        },
        paper: ({ theme }) => ({
          margin: theme.breakpoints.down('xs') ? '8px' : undefined,
        }),
      },
    },
    MuiDialogTitle: {
      defaultProps: {
        padding: [3],
        fontSize: defaultTheme.typography.pxToRem(24),
        fontWeight: 600,
      },
    },
    MuiDialogActions: {
      defaultProps: {
        sx: { padding: 3 },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(0,0,0,.8)'
              : 'rgba(46,48,51,.304)',
        }),
        invisible: {
          backgroundColor: 'unset',
          opacity: 'unset',
        },
      },
    },

    // Tooltips are fullscreen-aware
    MuiMenu: {
      defaultProps: {
        container: document.fullscreenElement ?? document.body,
      },
    },
    MuiTooltip: {
      // Tooltips have a darker background
      styleOverrides: {
        tooltip: ({ theme }) => ({
          fontSize: defaultTheme.typography.pxToRem(12),
          backgroundColor: 'rgb(33, 38, 44)',
          padding: theme.spacing(1),
        }),
      },

      // Tooltips are fullscreen-aware
      defaultProps: {
        PopperProps: {
          container: document.fullscreenElement ?? document.body,
        },
      },
    },
    // Tooltips are fullscreen-aware
    MuiPopover: {
      defaultProps: {
        container: document.fullscreenElement ?? document.body,
      },
    },
    // Buttons have to ripple but have the default keyboard focus ring instead
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          // Restore keyboard focus outline to the default browser value
          '&.Mui-focusVisible': {
            outline: 'revert',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        disableRipple: true,
      },
    },

    // Make toggle buttons small by default
    MuiToggleButton: {
      defaultProps: {
        size: 'small',
      },
    },

    // Switches look different in Element, similar to the iOS one.
    MuiSwitch: {
      defaultProps: {
        disableRipple: true,
      },
    },

    MuiDivider: {
      styleOverrides: {
        withChildren: {
          // Make sure it is possible to use an ellipsis inside the divider.
          // This gives the children more space and less space to the divider
          // itself.
          '&::before, &::after': {
            width: 'auto',
            flexGrow: 1,
            minWidth: '10%',
          },
        },
      },
    },

    // Make sure that radios have a focus visible effect as we removed the ripple
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible svg:first-of-type': {
            outlineColor: 'Highlight',
            outlineStyle: 'auto',
            outlineWidth: '2px',
            // Things are doubled here because Highlight is only supported by
            // Firefox
            outline: 'auto 2px -webkit-focus-ring-color',
            outlineOffset: -2,
            borderRadius: '50%',
          },

          // Remove the ripple
          '&:hover': {
            bgcolor: 'transparent',
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          // the default theme lightens and darkens the divider color further
          // which makes it too light in the light theme and too dark in the
          // dark theme.
          borderBottomColor: theme.palette.divider,
        }),
      },
    },
  },
};

export const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#f2f5f8',
    },
    text: {
      primary: '#17191c',
      secondary: '#61708b',
    },
    divider: '#e3e8f0',
  },

  components: {
    // Switches look different in Element, similar to the iOS one.
    MuiSwitch: {
      styleOverrides: createSwitchStyleOverrides({
        trackColor: '#E9E9EA',
        thumbColor: defaultTheme.palette.grey[600],
      }),
    },
  },
};

export const lightHighContrastTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    // Choosing different colors to have the correct contrast
    primary: {
      main: primaryColorHighContrast,
    },
    error: {
      main: errorColorHighContrast,
    },
    success: {
      main: '#37623B',
    },
    warning: {
      main: '#795015',
      contrastText: '#ffffff',
    },
    info: {
      main: '#025E88',
    },
    background: {
      default: '#ffffff',
      // We explicitly don't have a paper color and choose to add borders
      // instead. Otherwise our colors would all have to compare their contrast
      // to the paper color (the worst case).
      paper: '#ffffff',
    },
    text: {
      primary: '#101214',
      secondary: '#3F4345',
    },
    action: {
      active: '#5e6266',
    },
    divider: '#5e6266',
    // Stronger tonal offset as the colors are darker and won't change that much.
    tonalOffset: 0.2,
  },
  components: {
    MuiCard: {
      defaultProps: {
        // We disabled the background, but can use the border instead.
        variant: 'outlined',
      },
    },

    MuiAlert: {
      defaultProps: {
        // We disabled the background, but can use the border instead.
        variant: 'outlined',
      },
    },

    MuiChip: {
      defaultProps: {
        // We disabled the background, but can use the border instead.
        variant: 'outlined',
      },
      styleOverrides: {
        // Make the border color and delete icon have a higher contrast
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,

          '& .MuiChip-deleteIconOutlinedColorDefault': {
            color: theme.palette.divider,

            '&:hover': {
              color: theme.palette.divider,
            },
          },
        }),
      },
    },

    MuiInputBase: {
      styleOverrides: {
        input: {
          // Contrast requirements of at least 4.5:1 are also required for
          // placeholder text!
          '&::placeholder': {
            color: '#52575A',
            opacity: 0.9,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: ({ theme }) => ({
          // Give inputs borders a higher contrast
          borderColor: theme.palette.text.primary,
        }),
      },
    },

    // Switches look different in Element, similar to the iOS one.
    // The normal off color has no sufficient contrast
    MuiSwitch: {
      styleOverrides: createSwitchStyleOverrides({
        trackColor: '#8293AB',
        thumbColor: defaultTheme.palette.grey[100],
      }),
    },

    // Make toggle buttons have more contrast for the selected state
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          if (ownerState.disabled) {
            // Keep original style
            return {};
          }

          const selectedColor =
            ownerState.color === 'standard' || ownerState.color === undefined
              ? theme.palette.common.white
              : theme.palette[ownerState.color].contrastText;
          const selectedBackgroundColor =
            ownerState.color === 'standard' || ownerState.color === undefined
              ? theme.palette.grey['700']
              : theme.palette[ownerState.color].main;
          const selectedHoverBackgroundColor =
            ownerState.color === 'standard' || ownerState.color === undefined
              ? theme.palette.grey['800']
              : theme.palette[ownerState.color].dark;

          return {
            '&.Mui-selected': {
              backgroundColor: selectedBackgroundColor,
              color: selectedColor,

              '&:hover': {
                backgroundColor: selectedHoverBackgroundColor,
              },
            },
          };
        },
      },
    },
  },
};

export const darkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#15191e',
      paper: '#20252b',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b9bec6',
    },
    divider: '#394049',
  },
  components: {
    // Switches look different in Element, similar to the iOS one.
    MuiSwitch: {
      styleOverrides: createSwitchStyleOverrides({
        trackColor: '#39393D',
        thumbColor: defaultTheme.palette.grey[600],
      }),
    },
  },
};

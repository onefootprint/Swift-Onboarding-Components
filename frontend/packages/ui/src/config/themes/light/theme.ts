import { rgba } from 'polished';
import type { DefaultTheme } from 'styled';

import primitives from './primitives';

const themeUiStates = {
  accent: primitives.purple500,
  error: primitives.red500,
  info: primitives.blue500,
  success: primitives.green500,
  warning: primitives.yellow700,
};

const theme: DefaultTheme = {
  illustrations: 'light',
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  disable: {
    opacity: 0.5,
  },
  borderRadius: {
    0: 0,
    1: 6,
    2: 24,
    3: 1000,
  },
  backgroundColors: {
    transparent: 'transparent',
    primary: primitives.gray0,
    secondary: primitives.gray50,
    tertiary: primitives.brandSleep,
    quaternary: primitives.brandThink,
    quinary: primitives.brandGo,
  },
  dividerColors: {
    primary: primitives.gray100,
  },
  borderColors: {
    transparent: 'transparent',
    primary: primitives.gray150,
    secondary: primitives.purple500,
    ...themeUiStates,
  },
  borderWidths: {
    0: 0,
    1: 1,
    2: 2,
  },
  colors: {
    primary: primitives.brandSleep,
    secondary: primitives.gray800,
    tertiary: primitives.gray400,
    quaternary: primitives.gray0,
    quinary: primitives.brandThink,
    senary: primitives.brandGo,
    ...themeUiStates,
  },
  spacings: {
    0: 0,
    1: 2,
    2: 4,
    3: 8,
    4: 12,
    5: 16,
    6: 20,
    7: 24,
    8: 32,
    9: 40,
    10: 64,
  },
  typographies: {
    'display-1': {
      fontSize: 60,
      lineHeight: 72,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'display-2': {
      fontSize: 40,
      lineHeight: 52,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'display-3': {
      fontSize: 28,
      lineHeight: 36,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'heading-1': {
      fontSize: 24,
      lineHeight: 32,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'heading-2': {
      fontSize: 21,
      lineHeight: 28,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'heading-3': {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'body-1': {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: 'DM Sans',
      fontWeight: 400,
    },
    'body-2': {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'DM Sans',
      fontWeight: 400,
    },
    'body-3': {
      fontSize: 15,
      lineHeight: 20,
      fontFamily: 'DM Sans',
      fontWeight: 400,
    },
    'body-4': {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'DM Sans',
      fontWeight: 400,
    },
    'label-1': {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'label-2': {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'label-3': {
      fontSize: 15,
      lineHeight: 20,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'label-4': {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'caption-1': {
      fontSize: 13,
      lineHeight: 16,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'caption-2': {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
  },
  elevations: {
    0: 'none',
    1: '0px 1px 4px rgba(0, 0, 0, 0.12)',
    2: '0px 1px 8px rgba(0, 0, 0, 0.14)',
    3: '0px 1px 12px rgba(0, 0, 0, 0.18)',
  },
  overlays: {
    lighten: {
      1: rgba(primitives.gray0, 0.14),
      2: rgba(primitives.gray0, 0.18),
    },
    darken: {
      1: rgba(primitives.gray1000, 0.04),
      2: rgba(primitives.gray1000, 0.08),
    },
  },
  zIndices: {
    sticky: 5,
    dropdown: 10,
    modal: 20,
  },
};

export default theme;

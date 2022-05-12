import { rgba } from 'polished';
import type { DefaultTheme } from 'styled';

import borderRadius from '../shared/border-radius';
import borderWidth from '../shared/border-width';
import breakpoint from '../shared/breakpoint';
import grid from '../shared/grid';
import spacing from '../shared/spacing';
import typography from '../shared/typography';
import zIndex from '../shared/z-index';
import primitives from './primitives';

const themeUiStates = {
  accent: primitives.purple500,
  error: primitives.red500,
  info: primitives.blue500,
  success: primitives.green500,
  warning: primitives.yellow700,
};

const theme: DefaultTheme = {
  grid,
  typography,
  breakpoint,
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  backgroundColor: {
    transparent: 'transparent',
    primary: primitives.gray0,
    secondary: primitives.gray50,
    tertiary: primitives.brandSleep,
    quaternary: primitives.brandThink,
    quinary: primitives.brandGo,
    ...themeUiStates,
  },
  borderColor: {
    transparent: 'transparent',
    primary: primitives.gray150,
    secondary: primitives.purple500,
    tertiary: primitives.gray100,
    ...themeUiStates,
  },
  color: {
    primary: primitives.brandSleep,
    secondary: primitives.gray800,
    tertiary: primitives.gray400,
    quaternary: primitives.gray0,
    quinary: primitives.brandThink,
    senary: primitives.brandGo,
    ...themeUiStates,
  },
  elevation: {
    0: 'none',
    1: '0px 1px 4px rgba(0, 0, 0, 0.12)',
    2: '0px 1px 8px rgba(0, 0, 0, 0.14)',
    3: '0px 1px 12px rgba(0, 0, 0, 0.18)',
  },
  overlay: {
    lighten: {
      1: rgba(primitives.gray0, 0.14),
      2: rgba(primitives.gray0, 0.18),
    },
    darken: {
      1: rgba(primitives.gray1000, 0.04),
      2: rgba(primitives.gray1000, 0.08),
    },
  },
};

export default theme;

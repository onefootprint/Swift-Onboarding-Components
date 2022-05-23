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
  error: primitives.red600,
  info: primitives.blue600,
  success: primitives.green600,
  warning: primitives.yellow800,
  neutral: primitives.gray900,
  errorBackground: primitives.red100,
  infoBackground: primitives.blue100,
  successBackground: primitives.green100,
  warningBackground: primitives.yellow100,
  neutralBackground: primitives.gray100,
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
    tertiary: primitives.gray500,
    quaternary: primitives.gray400,
    quinary: primitives.gray0,
    senary: primitives.brandThink,
    septenary: primitives.brandGo,
    ...themeUiStates,
  },
  overlay: {
    lighten: {
      1: rgba(primitives.gray1000, 0.14),
      2: rgba(primitives.gray1000, 0.18),
    },
    darken: {
      1: rgba(primitives.gray0, 0.04),
      2: rgba(primitives.gray0, 0.08),
    },
  },
  elevation: {
    0: 'none',
    1: '0px 1px 4px rgba(0, 0, 0, 0.12)',
    2: '0px 1px 8px rgba(0, 0, 0, 0.14)',
    3: '0px 1px 12px rgba(0, 0, 0, 0.18)',
  },
};

export default theme;

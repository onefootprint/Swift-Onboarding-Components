import { rgba } from 'polished';
import type { DefaultTheme } from 'styled-components';

import borderRadius from '../shared/border-radius';
import borderWidth from '../shared/border-width';
import breakpoint from '../shared/breakpoint';
import grid from '../shared/grid';
import spacing from '../shared/spacing';
import typography from '../shared/typography';
import zIndex from '../shared/z-index';
import primitives from './primitives';

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
    senary: primitives.gray100,
    accent: primitives.purple500,
    error: primitives.red100,
    info: primitives.blue100,
    success: primitives.green100,
    warning: primitives.yellow100,
    neutral: primitives.gray50,
  },
  borderColor: {
    transparent: 'transparent',
    primary: primitives.gray150,
    secondary: primitives.purple500,
    tertiary: primitives.gray100,
    error: primitives.red500,
  },
  color: {
    primary: primitives.brandSleep,
    secondary: primitives.gray800,
    tertiary: primitives.gray500,
    quaternary: primitives.gray400,
    quinary: primitives.gray0,
    senary: primitives.brandThink,
    septenary: primitives.brandGo,
    accent: primitives.purple600,
    error: primitives.red600,
    info: primitives.blue600,
    success: primitives.green600,
    warning: primitives.yellow800,
    neutral: primitives.gray800,
  },
  elevation: {
    0: 'none',
    1: '0px 1px 4px rgba(0, 0, 0, 0.12)',
    2: '0px 1px 8px rgba(0, 0, 0, 0.14)',
    3: '0px 1px 12px rgba(0, 0, 0, 0.18)',
  },
  overlay: {
    'lighten-1': rgba(primitives.gray0, 0.14),
    'lighten-2': rgba(primitives.gray0, 0.18),
    'darken-1': rgba(primitives.gray1000, 0.04),
    'darken-2': rgba(primitives.gray1000, 0.08),
    'error-1': rgba(primitives.red500, 0.07),
    'error-2': rgba(primitives.red500, 0.15),
  },
};

export default theme;

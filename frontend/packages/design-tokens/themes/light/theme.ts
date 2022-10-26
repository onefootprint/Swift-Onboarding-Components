import { rgba } from 'polished';
import type { DefaultTheme } from 'styled-components';
import * as light from '../../output/light';

import borderRadius from '../shared/border-radius';
import borderWidth from '../shared/border-width';
import breakpoint from '../shared/breakpoint';
import grid from '../shared/grid';
import spacing from '../shared/spacing';
import typography from '../shared/typography';
import zIndex from '../shared/z-index';
import codeHighlight from './code-highlight';

const theme: DefaultTheme = {
  grid,
  typography,
  breakpoint,
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  codeHighlight,
  backgroundColor: {
    transparent: 'transparent',
    primary: light.primitivesGray0,
    secondary: light.primitivesGray50,
    tertiary: light.primitivesBrandSleep,
    quaternary: light.primitivesBrandThink,
    quinary: light.primitivesBrandGo,
    senary: light.primitivesGray100,
    accent: light.primitivesPurple500,
    error: light.primitivesRed50,
    info: light.primitivesBlue50,
    success: light.primitivesGreen50,
    warning: light.primitivesYellow50,
    neutral: light.primitivesGray50,
  },
  borderColor: {
    transparent: 'transparent',
    primary: light.primitivesGray150,
    secondary: light.primitivesPurple500,
    tertiary: light.primitivesGray100,
    error: light.primitivesRed500,
  },
  color: {
    primary: light.primitivesGray1000,
    secondary: light.primitivesGray800,
    tertiary: light.primitivesGray500,
    quaternary: light.primitivesGray400,
    quinary: light.primitivesGray0,
    senary: light.primitivesBrandThink,
    septenary: light.primitivesBrandGo,
    accent: light.primitivesPurple500,
    error: light.primitivesRed600,
    info: light.primitivesBlue600,
    success: light.primitivesGreen600,
    warning: light.primitivesYellow800,
    neutral: light.primitivesGray800,
  },
  elevation: {
    0: 'none',
    1: '0px 1px 4px rgba(0, 0, 0, 0.12)',
    2: '0px 1px 8px rgba(0, 0, 0, 0.14)',
    3: '0px 1px 12px rgba(0, 0, 0, 0.18)',
  },
  // TODO: Remove
  // https://linear.app/footprint/issue/FP-1728/bifrost-customization-remove-overlay-from-theme
  overlay: {
    'lighten-1': rgba(light.primitivesGray0, 0.14),
    'lighten-2': rgba(light.primitivesGray0, 0.18),
    'darken-1': rgba(light.primitivesGray1000, 0.04),
    'darken-2': rgba(light.primitivesGray1000, 0.08),
    'error-1': rgba(light.primitivesRed500, 0.07),
    'error-2': rgba(light.primitivesRed500, 0.15),
  },
};

export default theme;

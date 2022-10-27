import { rgba } from 'polished';
import type { DefaultTheme } from 'styled-components';
import * as dark from '../../output/dark';

import borderRadius from '../shared/border-radius';
import borderWidth from '../shared/border-width';
import breakpoint from '../shared/breakpoint';
import elevation from '../shared/elevation';
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
  elevation,
  backgroundColor: {
    transparent: 'transparent',
    primary: dark.primitivesGray0,
    secondary: dark.primitivesGray50,
    tertiary: dark.primitivesBrandSleep,
    quaternary: dark.primitivesBrandThink,
    quinary: dark.primitivesBrandGo,
    senary: dark.primitivesGray100,
    accent: dark.primitivesPurple500,
    error: dark.primitivesRed50,
    info: dark.primitivesBlue50,
    success: dark.primitivesGreen50,
    warning: dark.primitivesYellow50,
    neutral: dark.primitivesGray50,
  },
  borderColor: {
    transparent: 'transparent',
    primary: dark.primitivesGray150,
    secondary: dark.primitivesPurple500,
    tertiary: dark.primitivesGray100,
    error: dark.primitivesRed500,
  },
  color: {
    primary: dark.primitivesGray1000,
    secondary: dark.primitivesGray800,
    tertiary: dark.primitivesGray500,
    quaternary: dark.primitivesGray400,
    quinary: dark.primitivesGray0,
    senary: dark.primitivesBrandThink,
    septenary: dark.primitivesBrandGo,
    accent: dark.primitivesPurple500,
    error: dark.primitivesRed600,
    info: dark.primitivesBlue600,
    success: dark.primitivesGreen600,
    warning: dark.primitivesYellow800,
    neutral: dark.primitivesGray800,
  },
  // TODO: Remove
  // https://linear.app/footprint/issue/FP-1728/bifrost-customization-remove-overlay-from-theme
  overlay: {
    'lighten-1': rgba(dark.primitivesGray0, 0.14),
    'lighten-2': rgba(dark.primitivesGray0, 0.18),
    'darken-1': rgba(dark.primitivesGray1000, 0.04),
    'darken-2': rgba(dark.primitivesGray1000, 0.08),
    'error-1': rgba(dark.primitivesRed500, 0.07),
    'error-2': rgba(dark.primitivesRed500, 0.15),
  },
};

export default theme;

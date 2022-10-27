import { rgba } from 'polished';
import type { DefaultTheme } from 'styled-components';

import * as t from '../../output/light';
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
    primary: t.primitivesGray0,
    secondary: t.primitivesGray50,
    tertiary: t.primitivesBrandSleep,
    quaternary: t.primitivesBrandThink,
    quinary: t.primitivesBrandGo,
    senary: t.primitivesGray100,
    accent: t.primitivesPurple500,
    error: t.primitivesRed50,
    info: t.primitivesBlue50,
    success: t.primitivesGreen50,
    warning: t.primitivesYellow50,
    neutral: t.primitivesGray50,
  },
  borderColor: {
    transparent: 'transparent',
    primary: t.primitivesGray150,
    secondary: t.primitivesPurple500,
    tertiary: t.primitivesGray100,
    error: t.primitivesRed500,
  },
  color: {
    primary: t.primitivesGray1000,
    secondary: t.primitivesGray800,
    tertiary: t.primitivesGray500,
    quaternary: t.primitivesGray400,
    quinary: t.primitivesGray0,
    senary: t.primitivesBrandThink,
    septenary: t.primitivesBrandGo,
    accent: t.primitivesPurple500,
    error: t.primitivesRed600,
    info: t.primitivesBlue600,
    success: t.primitivesGreen600,
    warning: t.primitivesYellow800,
    neutral: t.primitivesGray800,
  },
  // TODO: Remove
  // https://linear.app/footprint/issue/FP-1728/bifrost-customization-remove-overlay-from-theme
  overlay: {
    'lighten-1': rgba(t.primitivesGray0, 0.14),
    'lighten-2': rgba(t.primitivesGray0, 0.18),
    'darken-1': rgba(t.primitivesGray1000, 0.04),
    'darken-2': rgba(t.primitivesGray1000, 0.08),
    'error-1': rgba(t.primitivesRed500, 0.07),
    'error-2': rgba(t.primitivesRed500, 0.15),
  },
};

export default theme;

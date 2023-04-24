import * as t from '../../output/light';
import borderRadius from '../shared/border-radius';
import borderWidth from '../shared/border-width';
import elevation from '../shared/elevation';
import spacing from '../shared/spacing';
import typography from '../shared/typography';
import type { Theme } from '../types';
import components from './components';

const theme: Theme = {
  typography,
  spacing,
  borderRadius,
  borderWidth,
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
  components,
};

export default theme;

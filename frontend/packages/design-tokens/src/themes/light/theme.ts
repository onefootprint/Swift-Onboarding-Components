import { rgba } from 'polished';

import * as t from '../../output/light';
import borderRadius from '../shared/border-radius';
import borderWidth from '../shared/border-width';
import breakpoint from '../shared/breakpoint';
import elevation from '../shared/elevation';
import grid from '../shared/grid';
import spacing from '../shared/spacing';
import typography from '../shared/typography';
import zIndex from '../shared/z-index';
import type { Theme } from '../types';
import codeHighlight from './code-highlight';
import components from './components';

const theme: Theme = {
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
    primary: 'var(--fp-primitives-gray-0)',
    secondary: 'var(--fp-primitives-gray-50)',
    tertiary: 'var(--fp-primitives-brand-sleep)',
    quaternary: 'var(--fp-primitives-brand-think)',
    quinary: 'var(--fp-primitives-brand-go)',
    senary: 'var(--fp-primitives-gray-100)',
    accent: 'var(--fp-primitives-purple-500)',
    error: 'var(--fp-primitives-red-50)',
    info: 'var(--fp-primitives-blue-50)',
    success: 'var(--fp-primitives-green-50)',
    warning: 'var(--fp-primitives-yellow-50)',
    neutral: 'var(--fp-primitives-gray-50)',
  },
  borderColor: {
    transparent: 'transparent',
    primary: 'var(--fp-primitives-gray-150)',
    secondary: 'var(--fp-primitives-purple-500)',
    tertiary: 'var(--fp-primitives-gray-100)',
    error: 'var(--fp-primitives-red-500)',
  },
  color: {
    primary: 'var(--fp-primitives-gray-1000)',
    secondary: 'var(--fp-primitives-gray-800)',
    tertiary: 'var(--fp-primitives-gray-500)',
    quaternary: 'var(--fp-primitives-gray-400)',
    quinary: 'var(--fp-primitives-gray-0)',
    senary: 'var(--fp-primitives-brand-think)',
    septenary: 'var(--fp-primitives-brand-go)',
    accent: 'var(--fp-primitives-purple-500)',
    error: 'var(--fp-primitives-red-600)',
    info: 'var(--fp-primitives-blue-600)',
    success: 'var(--fp-primitives-green-600)',
    warning: 'var(--fp-primitives-yellow-800)',
    neutral: 'var(--fp-primitives-gray-800)',
  },
  components,
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

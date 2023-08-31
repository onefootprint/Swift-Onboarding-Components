import { rgba } from 'polished';

import { borderRadius, borderWidth } from '../../primitives/borders';
import breakpoint from '../../primitives/breakpoint';
import * as t from '../../primitives/color';
import grid from '../../primitives/grid';
import { spacing } from '../../primitives/spacing';
import { fontFamily, typography } from '../../primitives/typography';
import zIndex from '../../primitives/z-index';
import {
  backgroundColor,
  borderColor,
  elevation,
  overlay,
  surfaceColor,
  textColor,
} from '../../tokens/dark';
import type { Theme } from '../types';
import codeHighlight from './code-highlight';
import components from './components';

const theme: Theme = {
  fontFamily,
  grid,
  typography,
  breakpoint,
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  codeHighlight,
  components,
  screenOverlay: overlay.default,
  elevation: {
    0: elevation[0],
    1: elevation[1],
    2: elevation[2],
    3: elevation[3],
  },
  backgroundColor: {
    transparent: backgroundColor.transparent,
    primary: backgroundColor.primary,
    secondary: backgroundColor.secondary,
    tertiary: backgroundColor.tertiary,
    quaternary: backgroundColor.quaternary,
    quinary: backgroundColor.quinary,
    senary: backgroundColor.senary,
    accent: backgroundColor.accent,
    error: backgroundColor.error,
    info: backgroundColor.info,
    success: backgroundColor.success,
    warning: backgroundColor.warning,
    neutral: backgroundColor.neutral,
    successInverted: backgroundColor.successInverted,
    warningInverted: backgroundColor.warningInverted,
    errorInverted: backgroundColor.errorInverted,
    infoInverted: backgroundColor.infoInverted,
    neutralInverted: backgroundColor.neutralInverted,
  },
  borderColor: {
    transparent: borderColor.transparent,
    primary: borderColor.primary,
    secondary: borderColor.secondary,
    tertiary: borderColor.tertiary,
    error: borderColor.error,
  },
  surfaceColor: {
    1: surfaceColor[1],
    2: surfaceColor[2],
    3: surfaceColor[3],
  },
  color: {
    primary: textColor.primary,
    secondary: textColor.secondary,
    tertiary: textColor.tertiary,
    quaternary: textColor.quaternary,
    quinary: textColor.quinary,
    senary: textColor.senary,
    septenary: textColor.septenary,
    accent: textColor.accent,
    error: textColor.error,
    info: textColor.info,
    success: textColor.success,
    warning: textColor.warning,
    neutral: textColor.neutral,
    successInverted: textColor.successInverted,
    warningInverted: textColor.warningInverted,
    errorInverted: textColor.errorInverted,
    infoInverted: textColor.infoInverted,
    neutralInverted: textColor.neutralInverted,
  },
  // TODO: Remove
  // https://linear.app/footprint/issue/FP-1728/bifrost-customization-remove-overlay-from-theme
  // keeping these for now to avoid breaking changes
  overlay: {
    'lighten-1': rgba(t.Gray0, 0.14),
    'lighten-2': rgba(t.Gray0, 0.18),
    'darken-1': rgba(t.Gray1000, 0.04),
    'darken-2': rgba(t.Gray1000, 0.08),
    'error-1': rgba(t.Red500, 0.07),
    'error-2': rgba(t.Red500, 0.15),
  },
};

export default theme;

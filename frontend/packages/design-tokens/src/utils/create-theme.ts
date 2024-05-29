import { rgba } from 'polished';

import { borderRadius, borderWidth } from '../primitives/borders';
import breakpoint from '../primitives/breakpoint';
import * as c from '../primitives/color';
import grid from '../primitives/grid';
import { spacing } from '../primitives/spacing';
import { fontFamily, typography } from '../primitives/typography';
import zIndex from '../primitives/z-index';
import type { Theme } from '../types';
import type { Tokens } from '../types/tokens';

const createTheme = (t: Tokens): Theme => ({
  fontFamily,
  grid,
  typography,
  breakpoint,
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  codeHighlight: t.codeHighlight,
  components: t.components,
  screenOverlay: t.overlay.default,
  elevation: {
    0: t.elevation[0],
    1: t.elevation[1],
    2: t.elevation[2],
    3: t.elevation[3],
    4: t.elevation[4],
  },
  backgroundColor: t.backgroundColor,
  borderColor: t.borderColor,
  color: t.textColor,
  // TODO: Remove
  // https://linear.app/footprint/issue/FP-1728/bifrost-customization-remove-overlay-from-theme
  // keeping these for now to avoid breaking changes
  overlay: {
    'lighten-1': rgba(c.Gray0, 0.14),
    'lighten-2': rgba(c.Gray0, 0.18),
    'darken-1': rgba(c.Gray1000, 0.04),
    'darken-2': rgba(c.Gray1000, 0.08),
    'error-1': rgba(c.Red500, 0.07),
    'error-2': rgba(c.Red500, 0.15),
  },
});

export default createTheme;

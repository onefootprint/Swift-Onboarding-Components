import 'styled-components';

import {
  ThemeBackgroundsColors,
  ThemeBorderColors,
  ThemeBorderRadius,
  ThemeBorderWidths,
  ThemeBreakPoints,
  ThemeColors,
  ThemeDisable,
  ThemeOverlay,
  ThemeSpacings,
  ThemeTypographies,
  ThemeTypography,
  ThemeZIndices,
} from './types';

declare module 'styled-components' {
  export interface DefaultTheme {
    backgroundColors: ThemeBackgroundsColors;
    borderColors: ThemeBorderColors;
    borderRadius: ThemeBorderRadius;
    borderWidths: ThemeBorderWidths;
    breakpoints: ThemeBreakPoints;
    colors: ThemeColors;
    disable: ThemeDisable;
    illustrations: 'dark' | 'light';
    overlays: ThemeOverlay;
    spacings: ThemeSpacings;
    zIndices: ThemeZIndices;
    typographies: {
      [key in ThemeTypographies]: ThemeTypography;
    };
  }
}

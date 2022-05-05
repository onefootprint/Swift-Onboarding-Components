import 'styled-components';

import type {
  ThemeBackgroundsColors,
  ThemeBorderColors,
  ThemeBorderRadius,
  ThemeBorderWidths,
  ThemeBreakPoints,
  ThemeColors,
  ThemeDisable,
  ThemeDividerColors,
  ThemeOverlay,
  ThemeSpacings,
  ThemeTypographies,
  ThemeTypography,
  ThemeZIndices,
} from 'styled';

declare module 'styled-components' {
  export interface DefaultTheme {
    backgroundColors: ThemeBackgroundsColors;
    borderColors: ThemeBorderColors;
    borderRadius: ThemeBorderRadius;
    borderWidths: ThemeBorderWidths;
    breakpoints: ThemeBreakPoints;
    colors: ThemeColors;
    disable: ThemeDisable;
    dividerColors: ThemeDividerColors;
    illustrations: 'dark' | 'light';
    overlays: ThemeOverlay;
    spacings: ThemeSpacings;
    zIndices: ThemeZIndices;
    typographies: {
      [key in ThemeTypographies]: ThemeTypography;
    };
  }
}

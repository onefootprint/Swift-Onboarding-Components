import 'styled-components';
import {
  ThemeDisable,
  ThemeBorderRadius,
  ThemeBreakPoints,
  ThemeBackgroundsColors,
  ThemeColors,
  ThemeBorderColors,
  ThemeBorderWidths,
  ThemeShapeFills,
  ThemeSpacings,
  ThemeBoxShadows,
  ThemeTypographies,
  ThemeTypography,
  ThemeZIndices,
} from './types';

declare module 'styled-components' {
  export interface DefaultTheme {
    illustrations: 'dark' | 'light';
    overlay: string;
    disable: ThemeDisable;
    borderRadius: ThemeBorderRadius;
    breakpoints: ThemeBreakPoints;
    backgroundColors: ThemeBackgroundsColors;
    colors: ThemeColors;
    borderColors: ThemeBorderColors;
    borderWidths: ThemeBorderWidths;
    shapeFills: ThemeShapeFills;
    spacings: ThemeSpacings;
    boxShadows: ThemeBoxShadows;
    zIndices: ThemeZIndices;
    typographies: {
      [key in ThemeTypographies]: ThemeTypography;
    };
  }
}

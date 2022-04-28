import 'styled-components';

import {
  ThemeBackgroundsColors,
  ThemeBorderColors,
  ThemeBorderRadius,
  ThemeBorderWidths,
  ThemeBoxShadows,
  ThemeBreakPoints,
  ThemeColors,
  ThemeDisable,
  ThemeSpacings,
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
    spacings: ThemeSpacings;
    boxShadows: ThemeBoxShadows;
    zIndices: ThemeZIndices;
    typographies: {
      [key in ThemeTypographies]: ThemeTypography;
    };
  }
}

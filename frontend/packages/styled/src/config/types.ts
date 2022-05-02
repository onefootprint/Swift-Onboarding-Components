import 'styled-components';

export type ThemeBreakPoints = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type ThemeBorderRadius = {
  0: number;
  1: number;
  2: number;
  3: number;
};

export type ThemeDisable = {
  opacity: number;
};

export type ThemeBackgroundsColors = {
  transparent: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
};

export type ThemeUIStates = {
  accent: string;
  error: string;
  info: string;
  success: string;
  warning: string;
};

export type ThemeBorderColors = {
  transparent: string;
  primary: string;
  secondary: string;
} & ThemeUIStates;

export type ThemeBorderWidths = {
  0: number;
  1: number;
  2: number;
};

export type ThemeElevations = {
  0: string;
  1: string;
  2: string;
  3: string;
};

export type ThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
} & ThemeUIStates;

export type ThemeSpacings = {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  10: number;
};

export type ThemeTypography = {
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  fontFamily: any;
};

export type ThemeTypographies =
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'body-1'
  | 'body-2'
  | 'body-3'
  | 'body-4'
  | 'label-1'
  | 'label-2'
  | 'label-3'
  | 'label-4'
  | 'caption-1'
  | 'caption-2';

export type ThemeOverlay = {
  darken: {
    1: string;
    2: string;
  };
  lighten: {
    1: string;
    2: string;
  };
};

export type ThemeZIndices = {
  bottomSheet: number;
  sticky: number;
  modal: number;
};

export type Colors = keyof ThemeColors;

export type Spacings = keyof ThemeSpacings;

export type Typographies = ThemeTypographies;

export type BorderRadius = keyof ThemeBorderRadius;

export type BreakPoints = keyof ThemeBreakPoints;

export type BackgroundsColors = keyof ThemeBackgroundsColors;

export type Overlays = keyof ThemeOverlay;

export type BorderWidths = keyof ThemeBorderWidths;

export type Elevations = ThemeElevations;

export type BorderColors = keyof ThemeBorderColors;

export type ZIndices = keyof ThemeZIndices;

export type DefaultTheme = {
  backgroundColors: ThemeBackgroundsColors;
  borderColors: ThemeBorderColors;
  borderRadius: ThemeBorderRadius;
  borderWidths: ThemeBorderWidths;
  breakpoints: ThemeBreakPoints;
  colors: ThemeColors;
  disable: ThemeDisable;
  elevations: ThemeElevations;
  illustrations: 'dark' | 'light';
  overlays: ThemeOverlay;
  spacings: ThemeSpacings;
  zIndices: ThemeZIndices;
  typographies: {
    [key in ThemeTypographies]: ThemeTypography;
  };
};

export type ThemeKey = keyof DefaultTheme;

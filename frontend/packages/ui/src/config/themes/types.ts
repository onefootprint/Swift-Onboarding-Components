import 'styled-components';

export type ThemeBreakPoints = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type ThemeBorderRadius = {
  none: number;
  round: number;
  base: number;
  large: number;
};

export type ThemeDisable = {
  opacity: number;
};

export type ThemeBackgroundsColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
};

export type ThemeUIStates = {
  success: string;
  warning: string;
  error: string;
  info: string;
};

export type ThemeBorderColors = {
  none: string;
  primary: string;
} & ThemeUIStates;

export type ThemeBorderWidths = {
  none: number;
  base: number;
  large: number;
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
  none: number;
  xTiny: number;
  tiny: number;
  xSmall: number;
  small: number;
  medium: number;
  base: number;
  large: number;
  xLarge: number;
  xxLarge: number;
  xxxLarge: number;
  xxxxLarge: number;
};

export type ThemeBoxShadows = {
  none: string;
  base: string;
  dark: string;
  darken: string;
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

export type BorderWidths = keyof ThemeBorderWidths;

export type BorderColors = keyof ThemeBorderColors;

export type BoxShadows = keyof ThemeBoxShadows;

export type ZIndices = keyof ThemeZIndices;

export type DefaultTheme = {
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
};

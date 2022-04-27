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
  elevated: string;
};

export type ThemeBorderColors = {
  none: string;
  transparent: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  success: string;
  info: string;
  error: string;
};

export type ThemeBorderWidths = {
  none: number;
  base: number;
  large: number;
};

export type ThemeSecondaryPalette = {
  camelotLight: string;
  camelotBase: string;
  camelotDark: string;
  camelotDarken: string;
  pomegranateLight: string;
  pomegranateBase: string;
  pomegranateDark: string;
  pomegranateDarken: string;
  capriSunLight: string;
  capriSunBase: string;
  capriSunDark: string;
  capriSunDarken: string;
  marinerLight: string;
  marinerBase: string;
  marinerDark: string;
  marinerDarken: string;
  indigoLight: string;
  indigoBase: string;
  indigoDark: string;
  indigoDarken: string;
  amethystLight: string;
  amethystBase: string;
  amethystDark: string;
  amethystDarken: string;
};

export type ThemeShapeFills = {
  transparent: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
  septenary: string;
  success: string;
  info: string;
  error: string;
} & ThemeSecondaryPalette;

export type ThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
  success: string;
  info: string;
  error: string;
} & ThemeSecondaryPalette;

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

export type ShapeFills = keyof ThemeShapeFills;

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
  shapeFills: ThemeShapeFills;
  spacings: ThemeSpacings;
  boxShadows: ThemeBoxShadows;
  zIndices: ThemeZIndices;
  typographies: {
    [key in ThemeTypographies]: ThemeTypography;
  };
};

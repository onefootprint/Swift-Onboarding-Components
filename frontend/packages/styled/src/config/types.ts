export type UIStates = {
  accent: string;
  error: string;
  info: string;
  success: string;
  warning: string;
  warningBackground: string;
  errorBackground: string;
  infoBackground: string;
  neutralBackground: string;
};

export type Typography = {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  fontFamily: any;
};

export type Typographies = Record<FontFamily, Typography>;

export type FontFamily =
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'display-4'
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

export type Overlays = {
  darken: {
    1: string;
    2: string;
  };
  lighten: {
    1: string;
    2: string;
  };
};

export type Colors = {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
} & UIStates;

export type Color = keyof Colors;

export type Spacings = {
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
  11: number;
  12: number;
};

export type Spacing = keyof Spacings;

export type BorderRadiuses = {
  0: number;
  1: number;
  2: number;
  3: number;
};

export type BorderRadius = keyof BorderRadiuses;

export type Breakpoints = {
  lg: number;
  md: number;
  sm: number;
  xl: number;
  xs: number;
};

export type Breakpoint = keyof Breakpoints;

type Size = {
  [key in Breakpoint]: number;
};

export type Grid = {
  columns: number;
  col: { gutterSize: Size };
  container: { margin: Size; maxWidth: Size };
};

export type BackgroundColors = {
  transparent: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
} & UIStates;

export type BackgroundsColor = keyof BackgroundColors;

export type Overlay = keyof Overlays;

export type BorderWidths = {
  0: number;
  1: number;
  2: number;
};

export type BorderWidth = keyof BorderWidths;

export type Elevations = {
  0: string;
  1: string;
  2: string;
  3: string;
};

export type Elevation = keyof Elevations;

export type BorderColors = {
  transparent: string;
  primary: string;
  secondary: string;
  tertiary: string;
} & UIStates;

export type BorderColor = keyof BorderColors;

export type ZIndexes = {
  dropdown: number;
  sticky: number;
  modal: number;
};

export type ZIndex = keyof ZIndexes;

export type DefaultTheme = {
  backgroundColor: BackgroundColors;
  borderColor: BorderColors;
  borderRadius: BorderRadiuses;
  borderWidth: BorderWidths;
  breakpoint: Breakpoints;
  color: Colors;
  elevation: Elevations;
  grid: Grid;
  overlay: Overlays;
  spacing: Spacings;
  typography: Typographies;
  zIndex: ZIndexes;
};

export type ThemeKey = keyof DefaultTheme;

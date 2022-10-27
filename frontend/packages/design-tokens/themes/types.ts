import * as CSS from 'csstype';

export type UIStates = {
  accent: string;
  error: string;
  info: string;
  neutral: string;
  success: string;
  warning: string;
};

export type FontVariant =
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
  | 'caption-2'
  | 'snippet-1'
  | 'snippet-2';

type Typography = {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  fontFamily: any;
};

export type Typographies = Record<FontVariant, Typography>;

export type Overlays = {
  'lighten-1': string;
  'lighten-2': string;
  'darken-1': string;
  'darken-2': string;
  'error-1': string;
  'error-2': string;
};

type Colors = {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
  septenary: string;
} & UIStates;

export type CodeHighlight<T = CSS.Properties> = {
  hljs: T;
  'hljs-comment': T;
  'hljs-quote': T;
  'hljs-doctag': T;
  'hljs-keyword': T;
  'hljs-formula': T;
  'hljs-section': T;
  'hljs-name': T;
  'hljs-selector-tag': T;
  'hljs-deletion': T;
  'hljs-subst': T;
  'hljs-literal': T;
  'hljs-string': T;
  'hljs-regexp': T;
  'hljs-addition': T;
  'hljs-attribute': T;
  'hljs-meta-string': T;
  'hljs-built_in': T;
  'hljs-class .hljs-title': T;
  'hljs-attr': T;
  'hljs-variable': T;
  'hljs-template-variable': T;
  'hljs-type': T;
  'hljs-selector-class': T;
  'hljs-selector-attr': T;
  'hljs-selector-pseudo': T;
  'hljs-number': T;
  'hljs-symbol': T;
  'hljs-bullet': T;
  'hljs-link': T;
  'hljs-meta': T;
  'hljs-selector-id': T;
  'hljs-title': T;
  'hljs-emphasis': T;
  'hljs-strong': T;
};

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
  13: number;
  14: number;
  15: number;
};

export type Spacing = keyof Spacings;

export type BorderRadiuses = {
  none: number;
  compact: number;
  default: number;
  large: number;
  full: number;
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

export type Grids = {
  columns: number;
  col: { gutterSize: Size };
  container: { margin: Size; maxWidth: Size };
};

type BackgroundColors = {
  transparent: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
} & UIStates;

export type BackgroundColor = keyof BackgroundColors;

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

type BorderColors = {
  transparent: string;
  primary: string;
  secondary: string;
  tertiary: string;
  error: string;
};

export type BorderColor = keyof BorderColors;

export type ZIndexes = {
  dropdown: number;
  tooltip: number;
  sticky: number;
  dialog: number;
  overlay: number;
  drawer: number;
  toast: number;
};

export type Theme = {
  backgroundColor: BackgroundColors;
  borderColor: BorderColors;
  borderRadius: BorderRadiuses;
  borderWidth: BorderWidths;
  breakpoint: Breakpoints;
  codeHighlight: CodeHighlight;
  color: Colors;
  elevation: Elevations;
  grid: Grids;
  overlay: Overlays;
  spacing: Spacings;
  typography: Typographies;
  zIndex: ZIndexes;
};

export type ThemeKey = keyof Theme;

export type UIState = keyof UIStates;

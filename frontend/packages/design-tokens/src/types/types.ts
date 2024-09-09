import type * as CSS from 'csstype';

import type { Bifrost, Button, Dropdown, Hint, Input, Label, Link, LinkButton, RadioSelect } from './components';

export type UIStates = {
  accent: string;
  error: string;
  info: string;
  neutral: string;
  success: string;
  warning: string;
  successInverted: string;
  warningInverted: string;
  errorInverted: string;
  infoInverted: string;
  neutralInverted: string;
};

export type FontFamilies = {
  default: string;
  code: string;
};

export type FontVariant =
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'display-4'
  | 'display-5'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'heading-5'
  | 'body-1'
  | 'body-2'
  | 'body-3'
  | 'label-1'
  | 'label-2'
  | 'label-3'
  | 'caption-1'
  | 'caption-2'
  | 'caption-3'
  | 'caption-4'
  | 'snippet-1'
  | 'snippet-2'
  | 'snippet-3';

export type Typography = {
  fontWeight: CSS.Property.FontWeight;
  fontSize: CSS.Property.FontSize;
  lineHeight: CSS.Property.LineHeight;
};

export type DeprecatedTypography = string;

export type Typographies = Record<FontVariant, Typography>;

export type Overlays = {
  'lighten-1': string;
  'lighten-2': string;
  'darken-1': string;
  'darken-2': string;
  'error-1': string;
  'error-2': string;
};

export type Overlay = keyof Overlays;

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
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  13: string;
  14: string;
  15: string;
};

export type Spacing = keyof Spacings;

export type BorderRadiuses = {
  none: string;
  sm: string;
  default: string;
  lg: string;
  xl: string;
  full: string;
};

export type BorderRadius = keyof BorderRadiuses;

export type Breakpoints = {
  xl: number;
  lg: number;
  md: number;
  sm: number;
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

export type BorderWidths = {
  0: string;
  1: string;
  2: string;
};

export type BorderWidth = keyof BorderWidths;

export type Elevations = {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
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
  confirmationDialog: number;
  popover: number;
  overlay: number;
  confirmationOverlay: number;
  bottomSheet: number;
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
  fontFamily: FontFamilies;
  grid: Grids;
  overlay: Overlays;
  screenOverlay: string;
  spacing: Spacings;
  typography: Typographies;
  zIndex: ZIndexes;
  components: {
    bifrost: Bifrost;
    button: Button;
    dropdown: Dropdown;
    input: Input;
    hint: Hint;
    label: Label;
    link: Link;
    linkButton: LinkButton;
    radioSelect: RadioSelect;
  };
};

export type ThemeKey = keyof Theme;

export type UIState = keyof UIStates;

export type FontFamily = keyof FontFamilies;

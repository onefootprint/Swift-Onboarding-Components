import type { Button, Dropdown, Hint, Input, Label, LinkButton, RadioSelect } from './components';

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
  | 'caption-3'
  | 'caption-4';

type Typography = string;

export type Typographies = Record<FontVariant, Typography>;

type Colors = {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
  septenary: string;
} & UIStates;

export type Color = keyof Colors;

export type Spacings = {
  0: string;
  1: string;
  // 4px
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
  compact: string;
  default: string;
  large: string;
  full: string;
};

export type BorderRadius = keyof BorderRadiuses;

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
  3: string;
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

export type Theme = {
  backgroundColor: BackgroundColors;
  borderColor: BorderColors;
  borderRadius: BorderRadiuses;
  borderWidth: BorderWidths;
  color: Colors;
  elevation: Elevations;
  spacing: Spacings;
  typography: Typographies;
  components: {
    button: Button;
    linkButton: LinkButton;
    dropdown: Dropdown;
    label: Label;
    hint: Hint;
    input: Input;
    radioSelect: RadioSelect;
  };
};

export type ThemeKey = keyof Theme;

export type UIState = keyof UIStates;

export * from './components';

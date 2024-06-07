import type * as CSS from 'csstype';

import type { Bifrost, Button, Dropdown, Hint, Input, Label, Link, LinkButton, RadioSelect } from './components';
import type { CodeHighlight } from './types';

export type Tokens = {
  backgroundColor: {
    primary: CSS.Property.BackgroundColor;
    secondary: CSS.Property.BackgroundColor;
    tertiary: CSS.Property.BackgroundColor;
    quaternary: CSS.Property.BackgroundColor;
    quinary: CSS.Property.BackgroundColor;
    senary: CSS.Property.BackgroundColor;
    accent: CSS.Property.BackgroundColor;
    error: CSS.Property.BackgroundColor;
    info: CSS.Property.BackgroundColor;
    success: CSS.Property.BackgroundColor;
    warning: CSS.Property.BackgroundColor;
    neutral: CSS.Property.BackgroundColor;
    active: CSS.Property.BackgroundColor;
    infoInverted: CSS.Property.BackgroundColor;
    successInverted: CSS.Property.BackgroundColor;
    warningInverted: CSS.Property.BackgroundColor;
    neutralInverted: CSS.Property.BackgroundColor;
    errorInverted: CSS.Property.BackgroundColor;
    transparent: CSS.Property.BackgroundColor;
  };
  primaryBtnBackgroundColor: {
    default: CSS.Property.BackgroundColor;
    hover: CSS.Property.BackgroundColor;
    active: CSS.Property.BackgroundColor;
    disabled: CSS.Property.BackgroundColor;
  };
  secondaryBtnBackgroundColor: {
    default: CSS.Property.BackgroundColor;
    hover: CSS.Property.BackgroundColor;
    active: CSS.Property.BackgroundColor;
    disabled: CSS.Property.BackgroundColor;
  };
  destructiveBtnBackgroundColor: {
    default: CSS.Property.BackgroundColor;
    hover: CSS.Property.BackgroundColor;
    active: CSS.Property.BackgroundColor;
    disabled: CSS.Property.BackgroundColor;
  };
  borderColor: {
    primary: CSS.Property.BorderColor;
    primaryHover: CSS.Property.BorderColor;
    secondary: CSS.Property.BorderColor;
    tertiary: CSS.Property.BorderColor;
    tertiaryHover: CSS.Property.BorderColor;
    error: CSS.Property.BorderColor;
    errorHover: CSS.Property.BorderColor;
    transparent: CSS.Property.BorderColor;
  };
  textColor: {
    primary: CSS.Property.Color;
    secondary: CSS.Property.Color;
    tertiary: CSS.Property.Color;
    quaternary: CSS.Property.Color;
    quinary: CSS.Property.Color;
    senary: CSS.Property.Color;
    septenary: CSS.Property.Color;
    accent: CSS.Property.Color;
    accentHover: CSS.Property.Color;
    error: CSS.Property.Color;
    errorHover: CSS.Property.Color;
    info: CSS.Property.Color;
    infoHover: CSS.Property.Color;
    success: CSS.Property.Color;
    successHover: CSS.Property.Color;
    warning: CSS.Property.Color;
    warningHover: CSS.Property.Color;
    neutral: CSS.Property.Color;
    successInverted: CSS.Property.Color;
    warningInverted: CSS.Property.Color;
    errorInverted: CSS.Property.Color;
    infoInverted: CSS.Property.Color;
    neutralInverted: CSS.Property.Color;
  };
  elevation: {
    0: CSS.Property.BoxShadow;
    1: CSS.Property.BoxShadow;
    2: CSS.Property.BoxShadow;
    3: CSS.Property.BoxShadow;
    4: CSS.Property.BoxShadow;
  };
  inputFocus: {
    none: CSS.Property.BoxShadow;
    default: CSS.Property.BoxShadow;
    error: CSS.Property.BoxShadow;
  };
  overlay: {
    default: CSS.Property.BackgroundColor;
  };
  codeHighlight: CodeHighlight;
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

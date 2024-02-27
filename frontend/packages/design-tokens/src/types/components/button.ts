import type * as CSS from 'csstype';

import type { Typography } from '../types';

type VariantStyles = Partial<{
  bg: CSS.Property.Background;
  color: CSS.Property.Color;
  borderColor: CSS.Property.BorderColor;
  buttonBoxShadow: CSS.Property.BoxShadow;
  boxShadow: CSS.Property.BoxShadow;
}>;

type Variant = VariantStyles & {
  hover: VariantStyles;
  active: VariantStyles;
  loading: VariantStyles;
  disabled: VariantStyles;
};

type Size = {
  height: CSS.Property.Height;
  paddingHorizontal: CSS.Property.PaddingLeft | CSS.Property.PaddingRight;
  typography: Typography;
};

export type Button = {
  borderWidth: CSS.Property.BorderWidth;
  borderRadius: CSS.Property.BorderRadius;
  transition: CSS.Property.Transition;
  variant: {
    primary: Variant;
    secondary: Variant;
    destructive: Variant;
  };
  size: {
    large: Size;
    compact: Size;
    default: Size;
  };
};

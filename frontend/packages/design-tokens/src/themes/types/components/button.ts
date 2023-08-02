import * as CSS from 'csstype';

import { Typography } from '../types';

type VariantStyles = Partial<{
  bg: CSS.Property.Background;
  color: CSS.Property.Color;
  borderColor: CSS.Property.BorderColor;
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
  elevation: {
    initial: CSS.Property.BoxShadow;
    hover: CSS.Property.BoxShadow;
    active: CSS.Property.BoxShadow;
  };
  variant: {
    primary: Variant;
    secondary: Variant;
  };
  size: {
    large: Size;
    compact: Size;
    small: Size;
    default: Size;
  };
};

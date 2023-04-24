import * as CSS from 'csstype';

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
  typography: string;
};

export type Button = {
  global: {
    borderWidth: CSS.Property.BorderWidth;
    borderRadius: CSS.Property.BorderRadius;
    elevation: {
      initial: CSS.Property.BoxShadow;
      hover: CSS.Property.BoxShadow;
      active: CSS.Property.BoxShadow;
    };
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

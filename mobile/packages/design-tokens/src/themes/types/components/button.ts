import * as CSS from 'csstype';

export type ButtonVariantStyles = {
  bg: CSS.Property.Background;
  color: CSS.Property.Color;
  borderColor: CSS.Property.BorderColor;
};

export type ButtonVariant = ButtonVariantStyles & {
  active: ButtonVariantStyles;
  loading: ButtonVariantStyles;
  disabled: ButtonVariantStyles;
};

export type ButtonSize = {
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
      active: CSS.Property.BoxShadow;
    };
  };
  variant: {
    primary: ButtonVariant;
    secondary: ButtonVariant;
  };
  size: {
    large: ButtonSize;
    compact: ButtonSize;
    small: ButtonSize;
    default: ButtonSize;
  };
};

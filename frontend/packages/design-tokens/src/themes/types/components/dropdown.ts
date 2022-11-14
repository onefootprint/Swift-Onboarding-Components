import * as CSS from 'csstype';

export type Dropdown = {
  bg: CSS.Property.Background;
  borderColor: CSS.Property.BorderColor;
  elevation: CSS.Property.BoxShadow;
  borderWidth: CSS.Property.BorderWidth;
  borderRadius: CSS.Property.BorderRadius;
  colorPrimary: CSS.Property.Color;
  colorSecondary: CSS.Property.Color;

  hover: {
    bg: CSS.Property.Background;
  };

  footer: {
    bg: CSS.Property.Background;
  };
};

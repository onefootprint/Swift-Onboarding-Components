import type * as CSS from 'csstype';

export type RadioSelect = {
  bg: CSS.Property.BackgroundColor;
  borderRadius: CSS.Property.BorderRadius;
  borderWidth: CSS.Property.BorderWidth;
  borderColor: CSS.Property.BorderColor;
  color: CSS.Property.Color;
  hover: {
    color: CSS.Property.Color;
    bg: CSS.Property.BackgroundColor;
    borderColor: CSS.Property.BorderColor;
  };
  selected: {
    color: CSS.Property.Color;
    bg: CSS.Property.BackgroundColor;
    borderColor: CSS.Property.BorderColor;
  };
  components: {
    icon: {
      bg: CSS.Property.BackgroundColor;
      hover: {
        bg: CSS.Property.BackgroundColor;
      };
      selected: {
        bg: CSS.Property.BackgroundColor;
      };
    };
  };
};

import type * as CSS from 'csstype';

export type RadioSelect = {
  bg: CSS.Property.BackgroundColor;
  borderRadius: CSS.Property.BorderRadius;
  borderWidth: CSS.Property.BorderWidth;
  borderColor: CSS.Property.BorderColor;
  color: CSS.Property.Color;
  hover: {
    initial: {
      bg: CSS.Property.BackgroundColor;
      borderColor: CSS.Property.BorderColor;
      color: CSS.Property.Color;
    };
    selected: {
      bg: CSS.Property.BackgroundColor;
      borderColor: CSS.Property.BorderColor;
      color: CSS.Property.Color;
    };
  };
  selected: {
    bg: CSS.Property.BackgroundColor;
    borderColor: CSS.Property.BorderColor;
    color: CSS.Property.Color;
  };
  disabled: {
    bg: CSS.Property.BackgroundColor;
    borderColor: CSS.Property.BorderColor;
    color: CSS.Property.Color;
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
      disabled: {
        bg: CSS.Property.BackgroundColor;
      };
    };
  };
};

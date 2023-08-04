import * as CSS from 'csstype';

export type RadioSelect = {
  bg: CSS.Property.BackgroundColor;
  borderRadius: CSS.Property.BorderRadius;
  borderWidth: CSS.Property.BorderWidth;
  borderColor: CSS.Property.BorderColor;
  color: CSS.Property.Color;
  hover: {
    default: {
      bg: CSS.Property.BackgroundColor;
      borderColor: CSS.Property.BorderColor;
    };
    selected: {
      bg: CSS.Property.BackgroundColor;
      borderColor: CSS.Property.BorderColor;
    };
  };
  selected: {
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

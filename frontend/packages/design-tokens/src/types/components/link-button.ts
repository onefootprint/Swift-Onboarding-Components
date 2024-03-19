import type * as CSS from 'csstype';

export type LinkButton = {
  default: {
    color: {
      text: {
        initial: CSS.Property.Color;
        active: CSS.Property.Color;
        hover: CSS.Property.Color;
        disabled: CSS.Property.Color;
      };
      icon: {
        initial: CSS.Property.Color;
        active: CSS.Property.Color;
        hover: CSS.Property.Color;
        disabled: CSS.Property.Color;
      };
    };
  };
  destructive: {
    color: {
      text: {
        initial: CSS.Property.Color;
        active: CSS.Property.Color;
        hover: CSS.Property.Color;
        disabled: CSS.Property.Color;
      };
      icon: {
        initial: CSS.Property.Color;
        active: CSS.Property.Color;
        hover: CSS.Property.Color;
        disabled: CSS.Property.Color;
      };
    };
  };
};

import type * as CSS from 'csstype';

export type Dropdown = {
  bg: CSS.Property.BackgroundColor;
  color: CSS.Property.Color;
  active: {
    bg: CSS.Property.BackgroundColor;
  };
};

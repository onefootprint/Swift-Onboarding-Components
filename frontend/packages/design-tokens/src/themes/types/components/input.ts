import * as CSS from 'csstype';

import type { Typography } from './typography';

export type Input = {
  global: {
    borderRadius: CSS.Property.BorderRadius;
    borderWidth: CSS.Property.BorderWidth;
    color: CSS.Property.Color;
    placeholderColor: CSS.Property.Color;
  };
  state: {
    default: {
      initial: {
        bg: CSS.Property.Background;
        border: CSS.Property.BorderColor;
        elevation: CSS.Property.BoxShadow;
      };
      hover: {
        bg: CSS.Property.Background;
        border: CSS.Property.BorderColor;
        elevation: CSS.Property.BoxShadow;
      };
      focus: {
        bg: CSS.Property.Background;
        border: CSS.Property.BorderColor;
        elevation: CSS.Property.BoxShadow;
      };
    };
    error: {
      initial: {
        bg: CSS.Property.Background;
        border: CSS.Property.BorderColor;
        elevation: CSS.Property.BoxShadow;
      };
      hover: {
        bg: CSS.Property.Background;
        border: CSS.Property.BorderColor;
        elevation: CSS.Property.BoxShadow;
      };
      focus: {
        bg: CSS.Property.Background;
        border: CSS.Property.BorderColor;
        elevation: CSS.Property.BoxShadow;
      };
    };
    disabled: {
      bg: CSS.Property.Background;
      border: CSS.Property.BorderColor;
    };
  };
  size: {
    default: {
      height: CSS.Property.Height;
      typography: Typography;
    };
    compact: {
      height: CSS.Property.Height;
      typography: Typography;
    };
  };
};

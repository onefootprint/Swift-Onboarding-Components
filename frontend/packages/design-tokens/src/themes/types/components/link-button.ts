import * as CSS from 'csstype';

import type { Typography } from '../types';

export type LinkButton = {
  variant: {
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
  size: {
    default: {
      height: CSS.Property.Height;
      typography: Typography;
    };
    compact: {
      height: CSS.Property.Height;
      typography: Typography;
    };
    tiny: {
      height: CSS.Property.Height;
      typography: Typography;
    };
    xTiny: {
      height: CSS.Property.Height;
      typography: Typography;
    };
    xxTiny: {
      height: CSS.Property.Height;
      typography: Typography;
    };
  };
};

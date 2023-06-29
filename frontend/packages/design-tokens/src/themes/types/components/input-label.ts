import * as CSS from 'csstype';

import type { Typography } from './typography';

export type InputLabel = {
  states: {
    default: {
      color: CSS.Property.Color;
    };
    error: {
      color: CSS.Property.Color;
    };
  };
  size: {
    default: {
      typography: Typography;
    };
    compact: {
      typography: Typography;
    };
  };
};

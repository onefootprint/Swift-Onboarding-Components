import type { Typography } from './typography';

export type InputLabel = {
  states: {
    default: {
      color: string;
    };
    error: {
      color: string;
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

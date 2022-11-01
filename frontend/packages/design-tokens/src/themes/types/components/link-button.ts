import type { Typography } from './typography';

export type LinkButton = {
  variant: {
    default: {
      color: {
        text: {
          initial: string;
          active: string;
          hover: string;
          disabled: string;
        };
        icon: {
          initial: string;
          active: string;
          hover: string;
          disabled: string;
        };
      };
    };
    destructive: {
      color: {
        text: {
          initial: string;
          active: string;
          hover: string;
          disabled: string;
        };
        icon: {
          initial: string;
          active: string;
          hover: string;
          disabled: string;
        };
      };
    };
  };
  size: {
    default: {
      height: number;
      typography: Typography;
    };
    compact: {
      height: number;
      typography: Typography;
    };
    tiny: {
      height: number;
      typography: Typography;
    };
    xTiny: {
      height: number;
      typography: Typography;
    };
    xxTiny: {
      height: number;
      typography: Typography;
    };
  };
};

import type { Typography } from './typography';

export type LinkButton = {
  variant: {
    default: {
      color: {
        text: {
          initial: string;
          active: string;
          disabled: string;
        };
        icon: {
          initial: string;
          active: string;
          disabled: string;
        };
      };
    };
    destructive: {
      color: {
        text: {
          initial: string;
          active: string;
          disabled: string;
        };
        icon: {
          initial: string;
          active: string;
          disabled: string;
        };
      };
    };
  };
  size: {
    default: {
      height: string;
      typography: Typography;
    };
    compact: {
      height: string;
      typography: Typography;
    };
    tiny: {
      height: string;
      typography: Typography;
    };
    xTiny: {
      height: string;
      typography: Typography;
    };
    xxTiny: {
      height: string;
      typography: Typography;
    };
  };
};

import type { Typography } from './typography';

export type Input = {
  global: {
    borderRadius: string;
    borderWidth: string;
    color: string;
    placeholderColor: string;
  };
  state: {
    default: {
      initial: {
        bg: string;
        border: string;
      };
      hover: {
        bg: string;
        border: string;
      };
      focus: {
        bg: string;
        border: string;
        elevation: string;
      };
    };
    error: {
      initial: {
        bg: string;
        border: string;
      };
      hover: {
        bg: string;
        border: string;
      };
      focus: {
        bg: string;
        border: string;
        elevation: string;
      };
    };
    disabled: {
      bg: string;
      border: string;
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
  };
};

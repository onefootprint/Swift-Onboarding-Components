import type { Typography } from './typography';

export type Input = {
  global: {
    borderRadius: number;
    borderWidth: number;
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
      height: number;
      typography: Typography;
    };
    compact: {
      height: number;
      typography: Typography;
    };
  };
};

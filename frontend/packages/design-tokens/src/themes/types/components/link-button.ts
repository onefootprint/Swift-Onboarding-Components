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
      typography: {
        fontFamily: string;
        fontWeight: number;
        lineHeight: string;
        fontSize: string;
      };
    };
    compact: {
      height: number;
      typography: {
        fontFamily: string;
        fontWeight: number;
        lineHeight: string;
        fontSize: string;
      };
    };
    tiny: {
      height: number;
      typography: {
        fontFamily: string;
        fontWeight: number;
        lineHeight: string;
        fontSize: string;
      };
    };
    xTiny: {
      height: number;
      typography: {
        fontFamily: string;
        fontWeight: number;
        lineHeight: string;
        fontSize: string;
      };
    };
    xxTiny: {
      height: number;
      typography: {
        fontFamily: string;
        fontWeight: number;
        lineHeight: string;
        fontSize: string;
      };
    };
  };
};

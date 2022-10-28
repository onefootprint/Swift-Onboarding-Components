type Variant = {
  bg: {
    initial: string;
    hover: string;
    active: string;
    disabled: string;
    loading: string;
  };
  color: {
    initial: string;
    hover: string;
    active: string;
    disabled: string;
    loading: string;
  };
  border: {
    initial: string;
    hover: string;
    active: string;
    disabled: string;
  };
};

type Size = {
  height: number;
  borderRadius: number;
  paddingHorizontal: number;
  typography: {
    fontFamily: string;
    fontWeight: number;
    lineHeight: string;
    fontSize: string;
  };
};

export type Button = {
  globals: {
    borderWidth: number;
    outlineOffset: number;
    elevation: {
      initial: string;
      hover: string;
      active: string;
    };
  };
  variant: {
    primary: Variant;
    secondary: Variant;
  };
  size: {
    large: Size;
    compact: Size;
    small: Size;
    default: Size;
  };
};

export default Button;

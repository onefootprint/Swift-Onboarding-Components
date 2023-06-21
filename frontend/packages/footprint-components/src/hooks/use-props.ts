type BaseProps = Record<string, any>;
type XProps<T extends BaseProps> = T;

// Gets the xprops from the window object and validates it against the given
// props type. If the xprops are invalid, returns undefined.
// xprops is like the wild wild west, no validations/typing on it otherwise.
const useProps = <T extends BaseProps>() => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const { xprops } = window as any;
  if (!xprops) {
    return undefined;
  }

  return xprops as XProps<T>;
};

export default useProps;

import type { Color } from 'themes';

const getIndicatorColor = (hasError: boolean, hasFocus: boolean): Color => {
  if (hasError) {
    return 'error';
  }
  return hasFocus ? 'accent' : 'quaternary';
};

export default getIndicatorColor;

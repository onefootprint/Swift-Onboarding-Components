import { typography } from '../../../primitives/typography';
import { textColor } from '../../../tokens/dark';
import type { Hint } from '../../types/components';

const hint: Hint = {
  states: {
    default: {
      color: textColor.secondary,
    },
    error: {
      color: textColor.error,
    },
  },
  size: {
    default: {
      typography: typography['caption-2'],
    },
    compact: {
      typography: typography['caption-3'],
    },
  },
};

export default hint;

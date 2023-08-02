import { typography } from '../../../primitives/typography';
import { textColor } from '../../../tokens/dark';
import type { InputLabel } from '../../types/components';

const inputLabel: InputLabel = {
  states: {
    default: {
      color: textColor.primary,
    },
    error: {
      color: textColor.primary,
    },
  },
  size: {
    default: {
      typography: typography['label-4'],
    },
    compact: {
      typography: typography['caption-1'],
    },
  },
};

export default inputLabel;

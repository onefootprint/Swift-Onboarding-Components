import { typography } from '../../../primitives/typography';
import { textColor } from '../../../tokens/light';
import type { Label } from '../../types/components';

const label: Label = {
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

export default label;

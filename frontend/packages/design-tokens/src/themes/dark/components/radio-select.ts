import { borderRadius, borderWidth } from '../../../primitives/borders';
import {
  backgroundColor,
  borderColor,
  surfaceColor,
  textColor,
} from '../../../tokens/dark';
import type { RadioSelect } from '../../types/components';

const radioSelect: RadioSelect = {
  bg: surfaceColor[1],
  borderRadius: borderRadius.default,
  borderWidth: borderWidth[1],
  borderColor: borderColor.tertiary,
  color: textColor.accent,
  hover: {
    default: {
      bg: surfaceColor[3],
      borderColor: borderColor.primary,
    },
    selected: {
      bg: surfaceColor[2],
      borderColor: borderColor.tertiary,
    },
  },
  selected: {
    bg: surfaceColor[1],
    borderColor: borderColor.secondary,
  },
  components: {
    icon: {
      bg: backgroundColor.secondary,
      hover: {
        bg: backgroundColor.senary,
      },
      selected: {
        bg: backgroundColor.accent,
      },
    },
  },
};

export default radioSelect;

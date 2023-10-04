import { borderRadius, borderWidth } from '../../../primitives/borders';
import {
  backgroundColor,
  borderColor,
  surfaceColor,
  textColor,
} from '../../../tokens/light';
import type { RadioSelect } from '../../types/components';

const radioSelect: RadioSelect = {
  bg: surfaceColor[1],
  borderRadius: borderRadius.default,
  borderWidth: borderWidth[1],
  borderColor: borderColor.tertiary,
  color: textColor.primary,
  hover: {
    default: {
      bg: surfaceColor[11],
      borderColor: borderColor.tertiary,
      color: textColor.primary,
    },
    selected: {
      bg: surfaceColor[41],
      borderColor: borderColor.tertiary,
      color: textColor.accent,
    },
  },
  selected: {
    color: textColor.accent,
    bg: surfaceColor[4],
    borderColor: borderColor.secondary,
  },
  disabled: {
    color: textColor.quaternary,
    bg: surfaceColor[1],
    borderColor: borderColor.tertiary,
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
      disabled: {
        bg: backgroundColor.secondary,
      },
    },
  },
};

export default radioSelect;

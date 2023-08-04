import { borderRadius, borderWidth } from '../../../primitives/borders';
import { backgroundColor, borderColor, textColor } from '../../../tokens/light';
import type { RadioSelect } from '../../types/components';

const radioSelect: RadioSelect = {
  bg: backgroundColor.transparent,
  borderRadius: borderRadius.default,
  borderWidth: borderWidth[1],
  borderColor: borderColor.tertiary,
  color: textColor.accent,
  hover: {
    bg: backgroundColor.secondary,
    borderColor: borderColor.tertiary,
  },
  selected: {
    bg: backgroundColor.active,
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

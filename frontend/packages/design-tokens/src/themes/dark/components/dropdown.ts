import { borderRadius, borderWidth } from '../../../primitives/borders';
import {
  backgroundColor,
  borderColor,
  elevation,
  surfaceColor,
  textColor,
} from '../../../tokens/dark';
import type { Dropdown } from '../../types/components';

const dropdown: Dropdown = {
  bg: surfaceColor[1],
  borderColor: borderColor.tertiary,
  borderWidth: borderWidth[1],
  elevation: elevation[3],
  borderRadius: borderRadius.default,
  colorPrimary: textColor.primary,
  colorSecondary: textColor.quaternary,
  hover: {
    bg: backgroundColor.secondary,
  },
  footer: {
    bg: backgroundColor.secondary,
  },
};

export default dropdown;

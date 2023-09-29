import { borderRadius, borderWidth } from '../../../primitives/borders';
import { inputHeights } from '../../../primitives/sizes';
import { typography } from '../../../primitives/typography';
import {
  backgroundColor,
  borderColor,
  inputFocus,
  textColor,
} from '../../../tokens/dark';
import type { Input } from '../../types/components';

const input: Input = {
  global: {
    borderRadius: borderRadius.default,
    borderWidth: borderWidth[1],
    color: textColor.primary,
    placeholderColor: textColor.quaternary,
  },
  state: {
    default: {
      initial: {
        bg: backgroundColor.primary,
        border: borderColor.primary,
        elevation: inputFocus.none,
      },
      hover: {
        bg: backgroundColor.primary,
        border: borderColor.primaryHover,
        elevation: inputFocus.none,
      },
      focus: {
        bg: backgroundColor.primary,
        border: borderColor.secondary,
        elevation: inputFocus.default,
      },
    },
    error: {
      initial: {
        bg: backgroundColor.primary,
        border: borderColor.error,
        elevation: inputFocus.error,
      },
      hover: {
        bg: backgroundColor.primary,
        border: borderColor.errorHover,
        elevation: inputFocus.none,
      },
      focus: {
        bg: backgroundColor.primary,
        border: borderColor.error,
        elevation: inputFocus.error,
      },
    },
    disabled: {
      bg: backgroundColor.secondary,
      border: borderColor.primary,
      color: textColor.quaternary,
      placeholderColor: textColor.quaternary,
    },
  },
  size: {
    default: {
      height: inputHeights.default,
      typography: typography['body-3'],
    },
    compact: {
      height: inputHeights.compact,
      typography: typography['body-4'],
    },
  },
};

export default input;

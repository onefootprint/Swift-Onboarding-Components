import * as t from '../../../output/light';
import type { Input } from '../../types/components/input';

const input: Input = {
  global: {
    borderRadius: t.baseInputsBorderRadius,
    borderWidth: t.baseInputsBorderWidth,
    color: t.baseInputsFocusTypingInputContent,
    placeholderColor: t.baseInputsInitialPlaceholder,
  },
  state: {
    default: {
      initial: {
        bg: t.baseInputsInitialBg,
        border: t.baseInputsInitialBorder,
      },
      hover: {
        bg: t.baseInputsHoverBg,
        border: t.baseInputsHoverBorder,
      },
      focus: {
        bg: t.baseInputsFocusBg,
        border: t.baseInputsFocusBorder,
        elevation: t.baseInputsElevationFocus,
      },
    },
    error: {
      initial: {
        bg: t.baseInputsFocusErrorBg,
        border: t.baseInputsInitialErrorBorder,
      },
      hover: {
        bg: t.baseInputsHoverErrorBg,
        border: t.baseInputsHoverErrorBorder,
      },
      focus: {
        bg: t.baseInputsFocusErrorBg,
        border: t.baseInputsFocusErrorBorder,
        elevation: t.baseInputsElevationFocusError,
      },
    },
    disabled: {
      bg: t.baseInputsDisabledBg,
      border: t.baseInputsDisabledBorder,
    },
  },
  size: {
    default: {
      height: t.baseInputsHeightDefault,
      typography: t.baseInputsTypographyDefaultInputContent,
    },
    compact: {
      height: t.baseInputsHeightCompact,
      typography: t.baseInputsTypographyCompactInputContent,
    },
  },
};

export default input;

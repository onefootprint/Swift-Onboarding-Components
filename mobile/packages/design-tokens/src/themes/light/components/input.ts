import * as t from '../../../output/light';
import type { Input } from '../../types/components';

const input: Input = {
  global: {
    borderRadius: `${t.baseInputsBorderRadius}px`,
    borderWidth: `${t.baseInputsBorderWidth}px`,
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
        bg: t.baseInputsInitialErrorBg,
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
      height: `${t.baseInputsHeightDefault}px`,
      typography: t.baseInputsTypographyDefaultInputContent,
    },
    compact: {
      height: `${t.baseInputsHeightCompact}px`,
      typography: t.baseInputsTypographyCompactInputContent,
    },
  },
};

export default input;

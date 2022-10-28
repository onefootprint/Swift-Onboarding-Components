import * as t from '../../../output/light';
import type { Button } from '../../types/components/button';

const button: Button = {
  globals: {
    borderWidth: t.buttonBorderWidth,
    outlineOffset: t.spacing2,
    elevation: {
      initial: t.buttonElevationInitial,
      hover: t.buttonElevationHover,
      active: t.buttonElevationActive,
    },
  },
  variant: {
    primary: {
      bg: {
        initial: t.buttonsPrimaryInitialBg,
        hover: t.buttonsPrimaryHoverBg,
        active: t.buttonsPrimaryActiveBg,
        disabled: t.buttonsPrimaryDisabledBg,
        loading: t.buttonsPrimaryLoadingBg,
      },
      color: {
        initial: t.buttonsPrimaryInitialText,
        hover: t.buttonsPrimaryHoverText,
        active: t.buttonsPrimaryActiveText,
        disabled: t.buttonsPrimaryDisabledText,
        loading: t.buttonsPrimaryLoadingIcon,
      },
      border: {
        initial: t.buttonsPrimaryInitialBorder,
        hover: t.buttonsPrimaryHoverBorder,
        active: t.buttonsPrimaryActiveBorder,
        disabled: t.buttonsPrimaryDisabledBorder,
      },
    },
    secondary: {
      bg: {
        initial: t.buttonsSecondaryInitialBg,
        hover: t.buttonsSecondaryHoverBg,
        active: t.buttonsSecondaryActiveBg,
        disabled: t.buttonsSecondaryDisabledBg,
        loading: t.buttonsSecondaryLoadingBg,
      },
      color: {
        initial: t.buttonsSecondaryInitialText,
        hover: t.buttonsSecondaryHoverText,
        active: t.buttonsSecondaryActiveText,
        disabled: t.buttonsSecondaryDisabledText,
        loading: t.buttonsSecondaryLoadingIcon,
      },
      border: {
        initial: t.buttonsSecondaryInitialBorder,
        hover: t.buttonsSecondaryHoverBorder,
        active: t.buttonsSecondaryActiveBorder,
        disabled: t.buttonsSecondaryDisabledBorder,
      },
    },
  },
  size: {
    large: {
      height: t.buttonsHeightLarge,
      borderRadius: t.buttonsBorderRadius,
      paddingHorizontal: t.buttonsSpacingPaddingsHorizontalLarge,
      typography: t.buttonsTypographyLarge,
    },
    compact: {
      height: t.buttonsHeightCompact,
      borderRadius: t.buttonsBorderRadius,
      paddingHorizontal: t.buttonsSpacingPaddingsHorizontalCompact,
      typography: t.buttonsTypographyCompact,
    },
    small: {
      height: t.buttonsHeightSmall,
      borderRadius: t.buttonsBorderRadius,
      paddingHorizontal: t.buttonsSpacingPaddingsHorizontalSmall,
      typography: t.buttonsTypographySmall,
    },
    default: {
      height: t.buttonsHeightDefault,
      borderRadius: t.buttonsBorderRadius,
      paddingHorizontal: t.buttonsSpacingPaddingsHorizontalDefault,
      typography: t.buttonsTypographyDefault,
    },
  },
};

export default button;

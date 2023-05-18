import * as t from '../../../output/light';
import type { Button } from '../../types/components';

const button: Button = {
  global: {
    borderRadius: t.buttonsBorderRadius,
    borderWidth: t.buttonBorderWidth,
    elevation: {
      initial: t.buttonElevationInitial,
      active: t.buttonElevationActive,
    },
  },
  variant: {
    primary: {
      bg: t.buttonsPrimaryInitialBg,
      color: t.buttonsPrimaryInitialText,
      borderColor: t.buttonsPrimaryInitialBorder,
      active: {
        bg: t.buttonsPrimaryActiveBg,
        color: t.buttonsPrimaryActiveText,
        borderColor: t.buttonsPrimaryActiveBorder,
      },
      loading: {
        bg: t.buttonsPrimaryLoadingBg,
        color: t.buttonsPrimaryLoadingIcon,
        borderColor: t.buttonsPrimaryLoadingBorder,
      },
      disabled: {
        bg: t.buttonsPrimaryDisabledBg,
        color: t.buttonsPrimaryDisabledText,
        borderColor: t.buttonsPrimaryDisabledBorder,
      },
    },
    secondary: {
      bg: t.buttonsSecondaryInitialBg,
      color: t.buttonsSecondaryInitialText,
      borderColor: t.buttonsSecondaryInitialBorder,
      active: {
        bg: t.buttonsSecondaryActiveBg,
        color: t.buttonsSecondaryActiveText,
        borderColor: t.buttonsSecondaryActiveBorder,
      },
      loading: {
        bg: t.buttonsSecondaryLoadingBg,
        color: t.buttonsSecondaryLoadingIcon,
        borderColor: t.buttonsSecondaryLoadingBorder,
      },
      disabled: {
        bg: t.buttonsSecondaryDisabledBg,
        color: t.buttonsSecondaryDisabledText,
        borderColor: t.buttonsSecondaryDisabledBorder,
      },
    },
  },
  size: {
    large: {
      height: t.buttonsHeightLarge,
      paddingHorizontal: t.buttonsSpacingPaddingsHorizontalLarge,
      typography: t.buttonsTypographyLarge,
    },
    compact: {
      height: t.buttonsHeightCompact,
      paddingHorizontal: t.buttonsSpacingPaddingsHorizontalCompact,
      typography: t.buttonsTypographyCompact,
    },
    small: {
      height: t.buttonsHeightSmall,
      paddingHorizontal: t.buttonsSpacingPaddingsHorizontalSmall,
      typography: t.buttonsTypographySmall,
    },
    default: {
      height: t.buttonsHeightDefault,
      paddingHorizontal: t.buttonsSpacingPaddingsHorizontalDefault,
      typography: t.buttonsTypographyDefault,
    },
  },
};

export default button;

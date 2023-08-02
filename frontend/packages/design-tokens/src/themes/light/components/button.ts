import { borderRadius, borderWidth } from '../../../primitives/borders';
import { buttonHeights } from '../../../primitives/sizes';
import { spacing } from '../../../primitives/spacing';
import { typography } from '../../../primitives/typography';
import {
  borderColor,
  elevation,
  primaryBtnBackgroundColor,
  secondaryBtnBackgroundColor,
  textColor,
} from '../../../tokens/light';
import type { Button } from '../../types/components';

const button: Button = {
  borderRadius: borderRadius.default,
  borderWidth: borderWidth[1],
  elevation: {
    initial: elevation[0],
    hover: elevation[0],
    active: elevation[0],
  },
  variant: {
    primary: {
      bg: primaryBtnBackgroundColor.default,
      color: textColor.quinary,
      borderColor: 'transparent',
      hover: {
        bg: primaryBtnBackgroundColor.hover,
        color: textColor.quinary,
        borderColor: 'transparent',
      },
      active: {
        bg: primaryBtnBackgroundColor.active,
        color: textColor.quinary,
        borderColor: 'transparent',
      },
      loading: {
        bg: primaryBtnBackgroundColor.default,
        color: textColor.quinary,
      },
      disabled: {
        bg: textColor.quaternary,
        color: primaryBtnBackgroundColor.disabled,
        borderColor: 'transparent',
      },
    },
    secondary: {
      bg: secondaryBtnBackgroundColor.default,
      color: textColor.primary,
      borderColor: borderColor.primary,
      hover: {
        bg: secondaryBtnBackgroundColor.hover,
        color: textColor.primary,
        borderColor: borderColor.primary,
      },
      active: {
        bg: secondaryBtnBackgroundColor.active,
        color: textColor.primary,
        borderColor: borderColor.primary,
      },
      loading: {
        bg: secondaryBtnBackgroundColor.default,
        color: textColor.primary,
      },
      disabled: {
        bg: secondaryBtnBackgroundColor.disabled,
        color: textColor.quaternary,
        borderColor: borderColor.tertiary,
      },
    },
  },
  size: {
    large: {
      height: buttonHeights.large,
      paddingHorizontal: spacing[7],
      typography: {
        fontSize: typography['label-1'].fontSize,
        fontWeight: typography['label-1'].fontWeight,
        lineHeight: typography['label-1'].lineHeight,
      },
    },
    compact: {
      height: buttonHeights.compact,
      paddingHorizontal: spacing[7],
      typography: typography['label-3'],
    },
    small: {
      height: buttonHeights.small,
      paddingHorizontal: spacing[4],
      typography: typography['label-4'],
    },
    default: {
      height: buttonHeights.default,
      paddingHorizontal: spacing[7],
      typography: typography['label-2'],
    },
  },
};

export default button;

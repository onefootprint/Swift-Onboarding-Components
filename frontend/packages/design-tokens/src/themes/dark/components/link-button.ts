import { linkButtonHeights } from '../../../primitives/sizes';
import { typography } from '../../../primitives/typography';
import { textColor } from '../../../tokens/dark';
import type { LinkButton } from '../../types/components';

const linkButton: LinkButton = {
  variant: {
    default: {
      color: {
        text: {
          initial: textColor.accent,
          active: textColor.accentHover,
          hover: textColor.accentHover,
          disabled: textColor.quaternary,
        },
        icon: {
          initial: textColor.accent,
          active: textColor.accentHover,
          hover: textColor.accentHover,
          disabled: textColor.quaternary,
        },
      },
    },
    destructive: {
      color: {
        text: {
          initial: textColor.error,
          active: textColor.errorHover,
          hover: textColor.errorHover,
          disabled: textColor.quaternary,
        },
        icon: {
          initial: textColor.error,
          active: textColor.errorHover,
          hover: textColor.errorHover,
          disabled: textColor.quaternary,
        },
      },
    },
  },
  size: {
    default: {
      height: linkButtonHeights.default,
      typography: typography['label-2'],
    },
    compact: {
      height: linkButtonHeights.compact,
      typography: typography['label-3'],
    },
    tiny: {
      height: linkButtonHeights.tiny,
      typography: typography['label-4'],
    },
    xTiny: {
      height: linkButtonHeights.xTiny,
      typography: typography['caption-1'],
    },
    xxTiny: {
      height: linkButtonHeights.xxTiny,
      typography: typography['caption-3'],
    },
  },
};

export default linkButton;

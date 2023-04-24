import * as t from '../../../output/light';
import type { LinkButton } from '../../types/components';

const linkButton: LinkButton = {
  variant: {
    default: {
      color: {
        text: {
          initial: t.linkButtonDefaultInitialText,
          active: t.linkButtonDefaultActiveText,
          hover: t.linkButtonDefaultHoverText,
          disabled: t.linkButtonDefaultDisabledText,
        },
        icon: {
          initial: t.linkButtonDefaultInitialIcon,
          active: t.linkButtonDefaultActiveIcon,
          hover: t.linkButtonDefaultHoverIcon,
          disabled: t.linkButtonDefaultDisabledIcon,
        },
      },
    },
    destructive: {
      color: {
        text: {
          initial: t.linkButtonDestructiveInitialText,
          active: t.linkButtonDestructiveActiveText,
          hover: t.linkButtonDestructiveHoverText,
          disabled: t.linkButtonDestructiveDisabledText,
        },
        icon: {
          active: t.linkButtonDestructiveActiveIcon,
          initial: t.linkButtonDestructiveInitialIcon,
          hover: t.linkButtonDestructiveHoverIcon,
          disabled: t.linkButtonDestructiveDisabledIcon,
        },
      },
    },
  },
  size: {
    default: {
      height: `${t.linkButtonSizingDefault}px`,
      typography: t.linkButtonTypographyDefault,
    },
    compact: {
      height: `${t.linkButtonSizingCompact}px`,
      typography: t.linkButtonTypographyCompact,
    },
    tiny: {
      height: `${t.linkButtonSizingTiny}px`,
      typography: t.linkButtonTypographyTiny,
    },
    xTiny: {
      height: `${t.linkButtonSizingXTiny}px`,
      typography: t.linkButtonTypographyXTiny,
    },
    xxTiny: {
      height: `${t.linkButtonSizingXxTiny}px`,
      typography: t.linkButtonTypographyXxTiny,
    },
  },
};

export default linkButton;

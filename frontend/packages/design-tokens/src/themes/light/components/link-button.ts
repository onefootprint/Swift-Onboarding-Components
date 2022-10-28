import * as t from '../../../output/light';

const linkButton = {
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
          initial: t.linkButtonDestructiveInitialIcon,
          active: t.linkButtonDestructiveActiveIcon,
          hover: t.linkButtonDestructiveHoverIcon,
          disabled: t.linkButtonDestructiveDisabledIcon,
        },
      },
    },
  },
  size: {
    default: {
      height: t.linkButtonSizingDefault,
      typography: t.linkButtonTypographyDefault,
    },
    compact: {
      height: t.linkButtonSizingCompact,
      typography: t.linkButtonTypographyCompact,
    },
    tiny: {
      height: t.linkButtonSizingTiny,
      typography: t.linkButtonTypographyTiny,
    },
    xTiny: {
      height: t.linkButtonSizingXTiny,
      typography: t.linkButtonTypographyXTiny,
    },
    xxTiny: {
      height: t.linkButtonSizingXxTiny,
      typography: t.linkButtonTypographyXxTiny,
    },
  },
};

export default linkButton;

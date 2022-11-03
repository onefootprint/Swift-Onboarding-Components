import type { LinkButton } from '../../types/components';

const linkButton: LinkButton = {
  variant: {
    default: {
      color: {
        text: {
          initial: 'var(--fp-link-button-default-initial-text)',
          active: 'var(--fp-link-button-default-active-text)',
          hover: 'var(--fp-link-button-default-hover-text)',
          disabled: 'var(--fp-link-button-default-disabled-text)',
        },
        icon: {
          initial: 'var(--fp-link-button-default-initial-icon)',
          active: 'var(--fp-link-button-default-active-icon)',
          hover: 'var(--fp-link-button-default-hover-icon)',
          disabled: 'var(--fp-link-button-default-disabled-icon)',
        },
      },
    },
    destructive: {
      color: {
        text: {
          initial: 'var(--fp-link-button-destructive-initial-text)',
          active: 'var(--fp-link-button-destructive-active-text)',
          hover: 'var(--fp-link-button-destructive-hover-text)',
          disabled: 'var(--fp-link-button-destructive-disabled-text)',
        },
        icon: {
          initial: 'var(--fp-link-button-destructive-initial-icon)',
          active: 'var(--fp-link-button-destructive-active-icon)',
          hover: 'var(--fp-link-button-destructive-hover-icon)',
          disabled: 'var(--fp-link-button-destructive-disabled-icon)',
        },
      },
    },
  },
  size: {
    default: {
      height: 'var(--fp-link-button-sizing-default)',
      typography: 'var(--fp-link-button-typography-default)',
    },
    compact: {
      height: 'var(--fp-link-button-sizing-compact)',
      typography: 'var(--fp-link-button-typography-compact)',
    },
    tiny: {
      height: 'var(--fp-link-button-sizing-tiny)',
      typography: 'var(--fp-link-button-typography-tiny)',
    },
    xTiny: {
      height: 'var(--fp-link-button-sizing-x-tiny)',
      typography: 'var(--fp-link-button-typography-x-tiny)',
    },
    xxTiny: {
      height: 'var(--fp-link-button-sizing-xx-tiny)',
      typography: 'var(--fp-link-button-typography-xx-tiny)',
    },
  },
};

export default linkButton;

import type { Button } from '../../types/components';

const button: Button = {
  global: {
    borderRadius: 'var(--fp-buttons-border-radius)',
    borderWidth: 'var(--fp-button-border-width)',
    elevation: {
      initial: 'var(--fp-button-elevation-initial)',
      hover: 'var(--fp-button-elevation-hover)',
      active: 'var(--fp-button-elevation-active)',
    },
  },
  variant: {
    primary: {
      bg: 'var(--fp-buttons-primary-initial-bg)',
      color: 'var(--fp-buttons-primary-initial-text)',
      borderColor: 'var(--fp-buttons-primary-initial-border)',
      hover: {
        bg: 'var(--fp-buttons-primary-hover-bg)',
        color: 'var(--fp-buttons-primary-hover-text)',
        borderColor: 'var(--fp-buttons-primary-hover-border)',
      },
      active: {
        bg: 'var(--fp-buttons-primary-active-bg)',
        color: 'var(--fp-buttons-primary-active-text)',
        borderColor: 'var(--fp-buttons-primary-active-border)',
      },
      loading: {
        bg: 'var(fp-buttons-primary-loading-bg)',
        color: 'var(fp-buttons-primary-loading-icon)',
      },
      disabled: {
        bg: 'var(--fp-buttons-primary-disabled-bg)',
        color: 'var(--fp-buttons-primary-disabled-text)',
        borderColor: 'var(--fp-buttons-primary-disabled-border)',
      },
    },
    secondary: {
      bg: 'var(--fp-buttons-secondary-initial-bg)',
      color: 'var(--fp-buttons-secondary-initial-text)',
      borderColor: 'var(--fp-buttons-secondary-initial-border)',
      hover: {
        bg: 'var(--fp-buttons-secondary-hover-bg)',
        color: 'var(--fp-buttons-secondary-hover-text)',
        borderColor: 'var(--fp-buttons-secondary-hover-border)',
      },
      active: {
        bg: 'var(--fp-buttons-secondary-active-bg)',
        color: 'var(--fp-buttons-secondary-active-text)',
        borderColor: 'var(--fp-buttons-secondary-active-border)',
      },
      loading: {
        bg: 'var(--fp-buttons-secondary-loading-bg)',
        color: 'var(--fp-buttons-secondary-loading-icon)',
      },
      disabled: {
        bg: 'var(--fp-buttons-secondary-disabled-bg)',
        color: 'var(--fp-buttons-secondary-disabled-text)',
        borderColor: 'var(--fp-buttons-secondary-disabled-border)',
      },
    },
  },
  size: {
    large: {
      height: 'var(--fp-buttons-height-large)',
      paddingHorizontal: 'var(--fp-buttons-spacing-paddings-horizontal-large)',
      typography: 'var(--fp-buttons-typography-large)',
    },
    compact: {
      height: 'var(--fp-buttons-height-compact)',
      paddingHorizontal:
        'var(--fp-buttons-spacing-paddings-horizontal-compact)',
      typography: 'var(--fp-buttons-typography-compact)',
    },
    small: {
      height: 'var(--fp-buttons-height-small)',
      paddingHorizontal: 'var(--fp-buttons-spacing-paddings-horizontal-small)',
      typography: 'var(--fp-buttons-typography-small)',
    },
    default: {
      height: 'var(--fp-buttons-height-default)',
      paddingHorizontal:
        'var(--fp-buttons-spacing-paddings-horizontal-default)',
      typography: 'var(--fp-buttons-typography-default)',
    },
  },
};

export default button;

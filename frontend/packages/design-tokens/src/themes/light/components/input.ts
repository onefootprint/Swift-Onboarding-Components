import type { Input } from '../../types/components';

const input: Input = {
  global: {
    borderRadius: 'var(--fp-base-inputs-border-radius)',
    borderWidth: 'var(--fp-base-inputs-border-width)',
    color: 'var(--fp-base-inputs-focus-typing-input-content)',
    placeholderColor: 'var(--fp-base-inputs-initial-placeholder)',
  },
  state: {
    default: {
      initial: {
        bg: 'var(--fp-base-inputs-initial-bg)',
        border: 'var(--fp-base-inputs-initial-border)',
        elevation: 'var(--fp-base-inputs-initial-elevation)',
      },
      hover: {
        bg: 'var(--fp-base-inputs-hover-bg)',
        border: 'var(--fp-base-inputs-hover-border)',
        elevation: 'var(--fp-base-inputs-hover-elevation)',
      },
      focus: {
        bg: 'var(--fp-base-inputs-focus-bg)',
        border: 'var(--fp-base-inputs-focus-border)',
        elevation: 'var(--fp-base-inputs-elevation-focus)',
      },
    },
    error: {
      initial: {
        bg: 'var(--fp-base-inputs-initial-error-bg)',
        border: 'var(--fp-base-inputs-initial-error-border)',
        elevation: 'var(--fp-base-inputs-initial-error-elevation)',
      },
      hover: {
        bg: 'var(--fp-base-inputs-hover-error-bg)',
        border: 'var(--fp-base-inputs-hover-error-border)',
        elevation: 'var(--fp-base-inputs-hover-error-elevation)',
      },
      focus: {
        bg: 'var(--fp-base-inputs-focus-error-bg)',
        border: 'var(--fp-base-inputs-focus-error-border)',
        elevation: 'var(--fp-base-inputs-elevation-focus-error)',
      },
    },
    disabled: {
      bg: 'var(--fp-base-inputs-disabled-bg)',
      border: 'var(--fp-base-inputs-disabled-border)',
    },
  },
  size: {
    default: {
      height: 'var(--fp-base-inputs-height-default)',
      typography: 'var(--fp-base-inputs-typography-default-input-content)',
    },
    compact: {
      height: 'var(--fp-base-inputs-height-compact)',
      typography: 'var(--fp-base-inputs-typography-compact-input-content)',
    },
  },
};

export default input;

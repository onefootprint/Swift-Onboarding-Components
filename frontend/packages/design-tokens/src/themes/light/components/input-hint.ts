import type { InputHint } from '../../types/components';

const inputHint: InputHint = {
  states: {
    default: {
      color: 'var(--fp-base-inputs-base-hint)',
    },
    error: {
      color: 'var(--fp-base-inputs-base-hint-error)',
    },
  },
  size: {
    default: {
      typography: 'var(--fp-base-inputs-typography-default-hint)',
    },
    compact: {
      typography: 'var(--fp-base-inputs-typography-compact-hint)',
    },
  },
};

export default inputHint;

import type { InputLabel } from '../../types/components';

const inputLabel: InputLabel = {
  states: {
    default: {
      color: 'var(--fp-base-inputs-initial-label)',
    },
    error: {
      color: 'var(--fp-base-inputs-initial-error-label)',
    },
  },
  size: {
    default: {
      typography: 'var(--fp-base-inputs-typography-default-label)',
    },
    compact: {
      typography: 'var(--fp-base-inputs-typography-compact-label)',
    },
  },
};

export default inputLabel;

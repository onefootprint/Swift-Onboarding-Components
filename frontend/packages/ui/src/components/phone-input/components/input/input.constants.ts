import type { CountryCode } from '@onefootprint/types';
import type { CleaveOptions } from 'cleave.js/options';

export const preferences: Partial<
  Record<
    CountryCode,
    {
      placeholder: string;
      mask: CleaveOptions;
    }
  >
> = {
  US: {
    placeholder: '(123) 456-7890',
    mask: {
      numericOnly: true,
      delimiters: ['(', ') ', '-'],
      blocks: [0, 3, 3, 4],
    },
  },
  CA: {
    placeholder: '(123) 456-7890',
    mask: {
      numericOnly: true,
      delimiters: ['(', ') ', '-'],
      blocks: [0, 3, 3, 4],
    },
  },
};

export const defaultPreference = {
  placeholder: '',
  mask: {
    numericOnly: true,
  },
};

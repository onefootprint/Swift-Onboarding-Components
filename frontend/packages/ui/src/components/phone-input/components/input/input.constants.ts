import type { CountryCode } from '@onefootprint/types';
import { CleaveOptions } from 'cleave.js/options';

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
      blocks: [0, 3, 3, Infinity],
    },
  },
  CA: {
    placeholder: '(123) 456-7890',
    mask: {
      numericOnly: true,
      delimiters: ['(', ') ', '-'],
      blocks: [0, 3, 3, Infinity],
    },
  },
};

export const defaultPreference = {
  placeholder: '',
  mask: {
    numericOnly: true,
  },
};

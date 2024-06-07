import type { SupportedLocale } from '@onefootprint/types';

export type Mask = {
  dob: {
    date: boolean;
    datePattern: ['m', 'd', 'Y'] | ['d', 'm', 'Y'];
    delimiter: '/';
    numericOnly: boolean;
    placeholder: 'MM/DD/YYYY' | 'DD/MM/YYYY';
  };
  visaExpiration: {
    date: boolean;
    datePattern: ['m', 'd', 'Y'] | ['d', 'm', 'Y'];
    delimiter: '/';
    numericOnly: boolean;
    placeholder: 'MM/DD/YYYY' | 'DD/MM/YYYY';
  };
  ssn?: { numericOnly: boolean; delimiters: string[]; blocks: number[] };
  lastFourSsn?: { numericOnly: boolean; blocks: number[] };
  tin?: { numericOnly: boolean; delimiters: string[]; blocks: number[] };
};

const masks: Record<SupportedLocale, Mask> = {
  'en-US': {
    dob: {
      date: true,
      numericOnly: true,
      delimiter: '/',
      datePattern: ['m', 'd', 'Y'],
      placeholder: 'MM/DD/YYYY',
    },
    visaExpiration: {
      date: true,
      numericOnly: true,
      delimiter: '/',
      datePattern: ['m', 'd', 'Y'],
      placeholder: 'MM/DD/YYYY',
    },
    ssn: {
      numericOnly: true,
      delimiters: ['-', '-'],
      blocks: [3, 2, 4],
    },
    lastFourSsn: {
      numericOnly: true,
      blocks: [4],
    },
    tin: {
      numericOnly: true,
      delimiters: ['-'],
      blocks: [2, 7],
    },
  },
  'es-MX': {
    dob: {
      date: true,
      numericOnly: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y'],
      placeholder: 'DD/MM/YYYY',
    },
    visaExpiration: {
      date: true,
      numericOnly: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y'],
      placeholder: 'DD/MM/YYYY',
    },
  },
};

export const useInputMask = (bcp47Code: SupportedLocale = 'en-US'): Mask => masks[bcp47Code] || masks['en-US'];

export default useInputMask;

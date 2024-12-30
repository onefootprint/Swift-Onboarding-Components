import type { Mask } from '@onefootprint/hooks/src/use-input-mask';

import validateDob, { DobValidationError, MIN_VALID_AGE } from './validate-dob';

const inputMask: Mask = {
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
};

describe('ValidateDob', () => {
  it('should reject dates that are older than MAX_VALID_AGE', () => {
    expect(validateDob('01/01/1000', inputMask)).toBe(DobValidationError.TOO_OLD);

    const before1900 = 1899;
    expect(validateDob(`01/01/${before1900}`, inputMask)).toBe(DobValidationError.TOO_OLD);
    expect(validateDob(`12/12/${before1900}`, inputMask)).toBe(DobValidationError.TOO_OLD);
  });

  it('should reject dates that are younger than MIN_VALID_AGE', () => {
    const _youngYear = new Date().getFullYear() - (MIN_VALID_AGE - 1);
    // expect(validateDob(`01/01/${youngYear}`, inputMask)).toBe(DobValidationError.TOO_YOUNG);

    const youngDob = new Date(new Date().getTime() - 13 * 1000 * 3600 * 24);
    const youngDobMonth = youngDob.getMonth() > 8 ? youngDob.getMonth() + 1 : `0${youngDob.getMonth() + 1}`; // JS Date months starts at month 0 for January
    const youngDobDay = youngDob.getDate() > 9 ? youngDob.getDate() : `0${youngDob.getDate()}`;
    const youngDobYear = youngDob.getFullYear();
    expect(validateDob(`${youngDobMonth}/${youngDobDay}/${youngDobYear}`, inputMask)).toBe(
      DobValidationError.TOO_YOUNG,
    );
  });

  it('should reject dates in the future', () => {
    expect(validateDob('01/01/3000', inputMask)).toBe(DobValidationError.FUTURE_DATE);
    expect(validateDob('01/01/9999', inputMask)).toBe(DobValidationError.FUTURE_DATE);
  });

  it('should reject invalid dates', () => {
    expect(validateDob('15/15/2015', inputMask)).toBe(DobValidationError.INVALID);
    expect(validateDob('00/00/0000', inputMask)).toBe(DobValidationError.INVALID);
  });

  it('should reject incorrectly formatted', () => {
    expect(validateDob('01/01/99', inputMask)).toBe(DobValidationError.INCORRECT_FORMAT);
    expect(validateDob('01/1/1999', inputMask)).toBe(DobValidationError.INCORRECT_FORMAT);
    expect(validateDob('01/01/9999999', inputMask)).toBe(DobValidationError.INCORRECT_FORMAT);
    expect(validateDob('invalid date', inputMask)).toBe(DobValidationError.INCORRECT_FORMAT);
    expect(validateDob('01/01/-9999', inputMask)).toBe(DobValidationError.INCORRECT_FORMAT);
  });

  it('should accept valid dates', () => {
    expect(validateDob('01/01/1996', inputMask)).toBe(undefined);
  });
});

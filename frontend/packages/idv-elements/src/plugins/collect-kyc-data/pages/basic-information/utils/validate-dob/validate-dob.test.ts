import validateDob, { MAX_VALID_AGE } from './validate-dob';

describe('ValidateDob', () => {
  it('rejects dates that are older than MAX_VALID_AGE', () => {
    expect(validateDob('01/01/1000')).toBe(false);

    const olderThanMaxDate = new Date().getFullYear() - MAX_VALID_AGE - 1;
    expect(validateDob(`01/01/${olderThanMaxDate}`)).toBe(false);
    expect(validateDob(`12/12/${olderThanMaxDate}`)).toBe(false);
  });

  it('rejects dates in the future', () => {
    expect(validateDob('01/01/3000')).toBe(false);
    expect(validateDob('01/01/9999')).toBe(false);
  });

  it('rejects incorrectly formatted or invalid dates', () => {
    expect(validateDob('01/01/-9999')).toBe(false);
    expect(validateDob('15/15/2015')).toBe(false);
    expect(validateDob('00/00/0000')).toBe(false);
    expect(validateDob('01/01/9999999')).toBe(false);
    expect(validateDob('invalid date')).toBe(false);
  });

  it('accepts valid dates', () => {
    expect(validateDob('01-01-2021')).toBe(true);
    expect(validateDob('01/01/1996')).toBe(true);
    expect(validateDob('05 06 1992')).toBe(true);
    expect(validateDob('Jun 7 1992')).toBe(true);
  });
});

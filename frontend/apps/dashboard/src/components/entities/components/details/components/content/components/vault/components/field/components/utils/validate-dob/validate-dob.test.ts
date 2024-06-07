import validateDob, { DobValidationError, MIN_VALID_AGE } from './validate-dob';

describe('ValidateDob', () => {
  it('should reject dates that are older than MAX_VALID_AGE', () => {
    expect(validateDob('01/01/1000')).toBe(DobValidationError.TOO_OLD);

    const before1900 = 1899;
    expect(validateDob(`01/01/${before1900}`)).toBe(DobValidationError.TOO_OLD);
    expect(validateDob(`12/12/${before1900}`)).toBe(DobValidationError.TOO_OLD);
  });

  it('should reject dates that are younger than MIN_VALID_AGE', () => {
    const youngYear = new Date().getFullYear() - (MIN_VALID_AGE - 1);
    expect(validateDob(`01/01/${youngYear}`)).toBe(DobValidationError.TOO_YOUNG);

    const youngDob = new Date(new Date().getTime() - 13 * 1000 * 3600 * 24);
    const youngDobMonth = youngDob.getMonth() > 8 ? youngDob.getMonth() + 1 : `0${youngDob.getMonth() + 1}`; // JS Date months starts at month 0 for January
    const youngDobDay = youngDob.getDate() > 9 ? youngDob.getDate() : `0${youngDob.getDate()}`;
    const youngDobYear = youngDob.getFullYear();
    expect(validateDob(`${youngDobMonth}/${youngDobDay}/${youngDobYear}`)).toBe(DobValidationError.TOO_YOUNG);
  });

  it('should reject dates in the future', () => {
    expect(validateDob('01/01/3000')).toBe(DobValidationError.FUTURE_DATE);
    expect(validateDob('01/01/9999')).toBe(DobValidationError.FUTURE_DATE);
  });

  it('should reject incorrectly formatted or invalid dates', () => {
    expect(validateDob('01/01/-9999')).toBe(DobValidationError.INVALID);
    expect(validateDob('15/15/2015')).toBe(DobValidationError.INVALID);
    expect(validateDob('00/00/0000')).toBe(DobValidationError.INVALID);
    expect(validateDob('01/01/9999999')).toBe(DobValidationError.INVALID);
    expect(validateDob('invalid date')).toBe(DobValidationError.INVALID);
  });

  it('should accept valid dates', () => {
    expect(validateDob('01/01/1996')).toBe(undefined);
    expect(validateDob('05 06 1992')).toBe(undefined);
    expect(validateDob('Jun 7 1992')).toBe(undefined);
    expect(validateDob('7 Jun 1992')).toBe(undefined);
  });
});

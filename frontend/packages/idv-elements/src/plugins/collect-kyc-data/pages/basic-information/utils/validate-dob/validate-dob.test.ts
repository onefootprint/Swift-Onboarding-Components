import validateDob, { MIN_VALID_AGE } from './validate-dob';

describe('ValidateDob', () => {
  it('rejects dates that are older than MAX_VALID_AGE', () => {
    expect(validateDob('01/01/1000')).toBe(false);

    const before1900 = 1899;
    expect(validateDob(`01/01/${before1900}`)).toBe(false);
    expect(validateDob(`12/12/${before1900}`)).toBe(false);
  });

  it('rejects dates that are younger than MIN_VALID_AGE', () => {
    const youngYear = new Date().getFullYear() - (MIN_VALID_AGE - 1);
    expect(validateDob(`01/01/${youngYear}`)).toBe(false);

    const youngDob = new Date(new Date().getTime() - 13 * 1000 * 3600 * 24);
    const youngDobMonth =
      youngDob.getMonth() > 8
        ? youngDob.getMonth() + 1
        : `0${youngDob.getMonth() + 1}`; // JS Date months starts at month 0 for January
    const youngDobDay =
      youngDob.getDate() > 9
        ? youngDob.getDate() + 1
        : `0${youngDob.getDate() + 1}`;
    const youngDobYear = youngDob.getFullYear();
    expect(validateDob(`${youngDobMonth}/${youngDobDay}/${youngDobYear}`)).toBe(
      false,
    );
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
    expect(validateDob('01/01/1996')).toBe(true);
    expect(validateDob('05 06 1992')).toBe(true);
    expect(validateDob('Jun 7 1992')).toBe(true);
  });
});

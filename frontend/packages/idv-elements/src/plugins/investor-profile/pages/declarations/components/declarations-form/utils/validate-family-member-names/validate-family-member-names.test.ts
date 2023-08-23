import validateFamilyMemberNames from './validate-family-member-names';

describe('validateFamilyMemberNames', () => {
  it('returns false for undefined or null values', () => {
    expect(validateFamilyMemberNames(undefined)).toBe(false);
  });

  it('validates names separated by commas', () => {
    const validInput1 = 'John Doe, Jane Doe';
    expect(validateFamilyMemberNames(validInput1)).toBe(true);

    const validInput2 = 'Jane Doe';
    expect(validateFamilyMemberNames(validInput2)).toBe(true);

    const validInput3 = ' Jack, Lorem, Ipsum';
    expect(validateFamilyMemberNames(validInput3)).toBe(true);

    const invalidInput = '123,456,789';
    expect(validateFamilyMemberNames(invalidInput)).toBe(false);
  });

  it('ignores spaces between comma-separated names', () => {
    const inputWithSpaces = 'John Doe , Jane Doe, Mary';
    expect(validateFamilyMemberNames(inputWithSpaces)).toBe(true);
  });

  it('returns false for empty names', () => {
    const inputWithEmptyName = 'John, , Jane';
    expect(validateFamilyMemberNames(inputWithEmptyName)).toBe(false);
  });
});

import validateName, { NameValidationError } from './validate-name';

describe('validateName', () => {
  it('should reject empty names', () => {
    expect(validateName('')).toBe(NameValidationError.EMPTY);
    expect(validateName(' ')).toBe(NameValidationError.EMPTY);
  });

  it('should reject names with invalid special characters', () => {
    expect(validateName('#$%')).toBe(NameValidationError.SPECIAL_CHARS);
    expect(validateName('!?')).toBe(NameValidationError.SPECIAL_CHARS);
    expect(validateName('*()')).toBe(NameValidationError.SPECIAL_CHARS);
    expect(validateName('Piip!?')).toBe(NameValidationError.SPECIAL_CHARS);
  });

  it('should accept valid names', () => {
    expect(validateName('Piip, the 2nd')).toBe(undefined);
    expect(validateName('Piip')).toBe(undefined);
    expect(validateName('Piip Long-foot ')).toBe(undefined);
    expect(validateName('Piip 2. ')).toBe(undefined);
  });
});

import validateName, { NameValidationError } from './validate-name';

describe('validateName', () => {
  it('rejects empty names', () => {
    expect(validateName('')).toBe(NameValidationError.EMPTY);
  });

  it('rejects names with invalid special characters', () => {
    expect(validateName('#$%')).toBe(NameValidationError.SPECIAL_CHARS);
    expect(validateName('!?')).toBe(NameValidationError.SPECIAL_CHARS);
    expect(validateName('*()')).toBe(NameValidationError.SPECIAL_CHARS);
    expect(validateName('Piip 2. ')).toBe(NameValidationError.SPECIAL_CHARS);
  });

  it('accepts valid names', () => {
    expect(validateName('Piip, the 2nd')).toBe(undefined);
    expect(validateName('Piip')).toBe(undefined);
    expect(validateName('Piip Long-foot ')).toBe(undefined);
  });
});

import isAlphanumeric from './is-alphanumeric';

describe('isAlphanumeric', () => {
  it('should return true for alphanumeric strings', () => {
    expect(isAlphanumeric('abc123')).toBe(true);
    expect(isAlphanumeric('123abc')).toBe(true);
    expect(isAlphanumeric('abc123abc')).toBe(true);
    expect(isAlphanumeric('123abc123')).toBe(true);
  });

  it('should return false for non-alphanumeric strings', () => {
    expect(isAlphanumeric('abc 123')).toBe(false);
    expect(isAlphanumeric('123 abc')).toBe(false);
    expect(isAlphanumeric('abc 123 abc')).toBe(false);
    expect(isAlphanumeric('123 abc 123')).toBe(false);
    expect(isAlphanumeric('abc-123')).toBe(false);
  });
});

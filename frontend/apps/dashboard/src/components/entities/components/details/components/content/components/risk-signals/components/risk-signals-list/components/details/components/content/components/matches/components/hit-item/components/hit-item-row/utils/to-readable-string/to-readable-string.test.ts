import toReadableString from './to-readable-string';

describe('toReadableString', () => {
  it('should parse correctly', () => {
    expect(toReadableString('name')).toBe('Name');
    expect(toReadableString('enforcementAgency')).toBe('Enforcement agency');
    expect(toReadableString('originalPlaceOfBirthText')).toBe('Original place of birth text');
    expect(toReadableString('eye_color')).toBe('Eye color');
    expect(toReadableString('original_place_of_birth_text')).toBe('Original place of birth text');
    expect(toReadableString('1234555')).toBe('1234555');
    expect(toReadableString('')).toBe('');
  });
});

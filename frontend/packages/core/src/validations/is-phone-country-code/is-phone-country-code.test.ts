import { describe, expect, it } from 'bun:test';
import isPhoneCountryCode from './is-phone-country-code';

describe('isPhoneCountryCode', () => {
  it('should return true for valid phone country codes', () => {
    expect(isPhoneCountryCode('1')).toBe(true);
    expect(isPhoneCountryCode('123')).toBe(true);
    expect(isPhoneCountryCode('999')).toBe(true);
  });

  it('should return false for invalid phone country codes', () => {
    expect(isPhoneCountryCode('')).toBe(false);
    expect(isPhoneCountryCode('1234')).toBe(false);
    expect(isPhoneCountryCode('abc')).toBe(false);
    expect(isPhoneCountryCode('1.23')).toBe(false);
  });
});

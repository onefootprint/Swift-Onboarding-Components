import { describe, expect, it } from 'bun:test';
import isEinFormat from './is-ein-format';

describe('isEinFormat', () => {
  it('should return false for empty string', () => {
    expect(isEinFormat('')).toBe(false);
  });

  it('should return false for null or undefined', () => {
    // @ts-expect-error: intentional invalid argument
    expect(isEinFormat(null)).toBe(false);
    // @ts-expect-error: intentional invalid argument
    expect(isEinFormat(undefined)).toBe(false);
  });

  it('should return false for invalid EIN format', () => {
    expect(isEinFormat('123456')).toBe(false); // less than 9 digits
    expect(isEinFormat('1234567890')).toBe(false); // more than 9 digits
    expect(isEinFormat('123-abc-def')).toBe(false); // non-numeric characters
  });

  it('should return true for valid EIN format', () => {
    expect(isEinFormat('12-3456789')).toBe(true);
    expect(isEinFormat('123456789')).toBe(true); // without dashes
  });
});

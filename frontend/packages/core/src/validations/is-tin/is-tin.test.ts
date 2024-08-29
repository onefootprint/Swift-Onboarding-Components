import { describe, expect, it } from 'bun:test';
import isTin from './is-tin';

describe('isTin', () => {
  it('should return true for valid TINs', () => {
    const validTINs = ['123456789', '000000000', '158209442'];
    validTINs.forEach(tin => {
      expect(isTin(tin)).toBe(true);
    });
  });

  it('should return false for invalid TINs', () => {
    const invalidTINs = [
      '87-0123456', // Has dash
      '423-12-3456', // Has dashes
      '1234567890', // Too long
      'abcdefghij', // Not a number
      '12345678', // Too short
      '', // Empty string
      '   ', // Just spaces
    ];
    invalidTINs.forEach(tin => {
      expect(isTin(tin)).toBe(false);
    });
  });
});

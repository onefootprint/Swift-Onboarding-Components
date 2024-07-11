import { describe, expect, it } from 'bun:test';
import isSSN4 from './is-ssn4';

describe('isSSN4', () => {
  describe('valid last 4 digits of SSN', () => {
    it('should return true for valid inputs', () => {
      const validSSN4 = [
        '1234', // General valid case
        '0012', // Valid with leading zeros
        '1000', // Valid ending with zero
        '9999', // Valid with all digits the same except '0000'
        '0101', // Valid, includes zeros not at the start
      ];

      validSSN4.forEach(ssn4 => {
        expect(isSSN4(ssn4)).toBe(true);
      });
    });
  });

  describe('invalid last 4 digits of SSN', () => {
    it('should return false for invalid inputs', () => {
      const invalidSSN4 = [
        '0000', // Explicitly disallowed
        '123', // Too short
        '12345', // Too long
        'abcd', // Not digits
        '0123 ', // Space after the digits
        ' 0123', // Space before the digits
        '9a2b', // Contains non-digit characters
        '', // empty string
        '  ', // spaces
      ];

      invalidSSN4.forEach(ssn4 => {
        expect(isSSN4(ssn4)).toBe(false);
      });
    });
  });
});

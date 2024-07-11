import { describe, expect, it } from 'bun:test';
import isSSN9, { isSSN9Flexible } from './is-ssn9';

describe('isSSN9', () => {
  describe('valid SSNs', () => {
    it('should return true for valid SSNs', () => {
      const validSSNs = ['123-45-6789', '001-02-3456', '078-05-1120'];

      validSSNs.forEach(ssn => {
        expect(isSSN9(ssn)).toBe(true);
        expect(isSSN9Flexible(ssn)).toBe(true);
      });
    });

    it('should return true for valid SSNs flexible', () => {
      const validSSNs = ['123456789', '001023456', '078051120'];

      validSSNs.forEach(ssn => {
        expect(isSSN9Flexible(ssn)).toBe(true);
      });
    });
  });

  describe('invalid SSNs', () => {
    it('should return false for invalid SSNs', () => {
      const validWithoutDashes = '078051120'; // Correct number but without dashes
      const invalidSSNs = [
        '',
        '000-12-3456', // Invalid area number (000)
        '666-12-3456', // Invalid area number (666)
        '900-12-3456', // Invalid area number (900-999)
        '123-00-6789', // Invalid group number (00)
        '123-45-0000', // Invalid serial number (0000)
        '123-45-67890', // Too long
        'abcdefghij', // Not a number
        '123-45-678', // Too short
        '', // empty string
        '   ', // just spaces
      ];

      expect(isSSN9(validWithoutDashes)).toBe(false);

      invalidSSNs.forEach(ssn => {
        expect(isSSN9(ssn)).toBe(false);
        expect(isSSN9Flexible(ssn)).toBe(false);
      });
    });
  });
});

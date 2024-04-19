/**
 * Open Issue importing from validator/es/
 * @see https://github.com/validatorjs/validator.js/issues/1759
 *
 * Collecting page data  ...node_modules/validator/es/lib/isMobilePhone.js:1
 * import assertString from './util/assertString';
 * SyntaxError: Cannot use import statement outside a module
 */
import isPhoneNumber from 'validator/lib/isMobilePhone'; // import isPhoneNumber from 'validator/es/lib/isMobilePhone';

describe('isPhoneNumber', () => {
  describe('valid phone numbers', () => {
    it('should return true', () => {
      const validPhoneNumbers = [
        // International format
        // '+1234567890',

        // US
        '+12125552368', // Standard US mobile format with country code
        '2125552368', // US mobile without country code
        '(212) 555-2368', // US mobile with parentheses
        '212-555-2368', // US mobile with dashes
        '+1 212-555-2368', // US mobile with country code and dashes

        // MX Mobile Numbers
        '+521234567890', // Standard MX mobile format with country code
        '+521234567890', // Standard MX mobile format with country code
        '1234567890', // MX mobile without country code
        '044123456790', // MX mobile with domestic prefix
      ];

      validPhoneNumbers.forEach(number => {
        expect(isPhoneNumber(number)).toBe(true);
      });
    });
  });

  describe('invalid phone numbers', () => {
    it('should return false', () => {
      const invalidPhoneNumbers = [
        '12345', // Too short
        'phone number', // Not a number
        '+12345678901234567890', // Too long
        '123-456-7890', // US format but missing country code
        'abcd efgh ijkl', // Alphabets
        '+1 234 567', // Too short even with country code
        '+999 123456', // Non-existent country code
        '123-45-678', // Missing digits
        '(123) 456-7890', // US format with parentheses but missing country code
      ];

      invalidPhoneNumbers.forEach(number => {
        expect(isPhoneNumber(number)).toBe(false);
      });
    });
  });
});

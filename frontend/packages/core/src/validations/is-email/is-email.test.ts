/**
 * Open Issue importing from validator/es/
 * @see https://github.com/validatorjs/validator.js/issues/1759
 *
 * Collecting page data  ...frontend/node_modules/validator/es/lib/isEmail.js:1
 * import assertString from './util/assertString';
 * SyntaxError: Cannot use import statement outside a module
 */
import isEmail from 'validator/lib/isEmail'; // import isEmail from 'validator/es/lib/isEmail';

describe('isEmail', () => {
  describe('valid emails', () => {
    test('should return true', () => {
      const validEmails = [
        'email@example.com',
        'jane.doe@example.com',
        'email@subdomain.example.com',
        'firstname+lastname@example.com',
      ];

      validEmails.forEach(email => {
        expect(isEmail(email)).toBe(true);
      });
    });
  });

  describe('invalid emails', () => {
    it('should return false', () => {
      const invalidEmails = [
        'plainaddress',
        '@no-local-part.com',
        'Outerspace@this is not allowed.com',
        'john.doe@example..com',
        'a"b(c)d,e:f;g<h>i[j\\k]l@example.com',
      ];

      invalidEmails.forEach(email => {
        expect(isEmail(email)).toBe(false);
      });
    });
  });
});

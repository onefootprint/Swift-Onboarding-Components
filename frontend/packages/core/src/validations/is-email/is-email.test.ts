import isEmail from './is-email';

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

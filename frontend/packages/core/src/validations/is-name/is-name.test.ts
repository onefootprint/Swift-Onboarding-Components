import { describe, expect, it } from 'bun:test';
import isName from './is-name';

describe('Name Validation', () => {
  describe('Valid names', () => {
    it('should return true for names without disallowed characters', () => {
      const validNames = [
        'John Doe',
        'Jane-Doe',
        "O'Connor",
        'Jean Pierre',
        'María José',
        'Muhammad Ali',
        'Chloë Grace',
      ];

      validNames.forEach(name => {
        expect(isName(name)).toBe(true);
      });
    });
  });

  describe('Invalid names', () => {
    it('should return false for names with disallowed characters', () => {
      const invalidNames = [
        'John@Doe',
        'Jane#Doe',
        'Invalid_Name',
        'Some+Name',
        '/Special\\Name',
        '<Script>',
        '~Tilde`Name',
        'Name!?',
        '[Brackets]',
        '{Curly Braces}',
      ];

      invalidNames.forEach(name => {
        expect(isName(name)).toBe(false);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings and only spaces as invalid', () => {
      expect(isName('')).toBe(false);
      expect(isName('   ')).toBe(false);
    });

    it('should be case insensitive and handle international characters', () => {
      const specialNames = ['Søren Kierkegaard', 'François Hollande', 'Jürgen Habermas', 'José Mourinho'];

      specialNames.forEach(name => {
        expect(isName(name)).toBe(true);
      });
    });
  });
});

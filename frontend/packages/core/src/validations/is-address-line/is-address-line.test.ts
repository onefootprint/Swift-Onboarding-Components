import { describe, expect, it } from 'bun:test';
import isAddressLine from './is-address-line';

describe('Address line validation', () => {
  describe('Valid address lines', () => {
    it('should return true for entries without PO box', () => {
      const validList = [
        '123 Cherry Lane, Apt 12',
        '123 Main Street at 4th Avenue',
        '123 Main Street, Apt 4B',
        '123 Main Street',
        '1234 Highway 6',
        '1600 Pennsylvania Avenue NW',
        '1st St. & Market St.',
        '456 Elm St. & Pine St.',
        '456 Elm St., Suite 200',
        '456 Elm St.',
        '456 Oak Blvd, Suite 300',
        '5432 Route 66',
        '5th Avenue at Central Park',
        '742 Evergreen Terrace',
        '789 Maple Avenue, Unit 5',
        '789 Maple Avenue',
        '789 Route 9',
        '9876 Highway 50',
        'Blue Ridge Towers, Suite 101',
        'Greenfield Apartments, Unit 5D',
        'Lincoln Towers, Apt 5E',
        'Post Office Box 789',
        'Riverfront Complex, Building 2',
        'RR 1, Box 789',
        'RR 2, Box 123',
        'Rural Route 2, Box 56',
        'Rural Route 3, Box 456',
      ];

      validList.forEach(name => {
        expect(isAddressLine(name)).toBe(true);
      });
    });
  });

  describe('Invalid address lines', () => {
    it('should return false for PO box', () => {
      const invalidList = [
        'P.O. Box 12345',
        'P.O. Box 456',
        'PO Box 123',
        'PO Box 999',
        // '123 Main Street @ Elm',
        // '123 Main',
        // '123',
        // 'Apt 4B',
        // 'Suite 300',
      ];

      invalidList.forEach(name => {
        expect(isAddressLine(name)).toBe(false);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings and only spaces as invalid', () => {
      expect(isAddressLine('')).toBe(false);
      expect(isAddressLine('   ')).toBe(false);
    });
  });
});

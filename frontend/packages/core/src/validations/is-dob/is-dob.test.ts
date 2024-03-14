import isDob, { isDobInTheFuture, isDobTooOld, isDobTooYoung } from './is-dob';

describe('DOB Validator', () => {
  describe('isTooOld', () => {
    it('should return true for ages over the maximum age limit', () => {
      const today = new Date('2024-01-01');
      const age200 = '1824-01-01';

      expect(isDobTooOld(age200, today)).toBe(true);
    });

    it('should return false for ages within the maximum age limit', () => {
      const today = new Date('2024-01-01');
      const age50 = '1974-01-01';
      expect(isDobTooOld(age50, today)).toBe(false);
    });
  });

  describe('isTooYoung', () => {
    it('should return true for ages under the minimum age limit', () => {
      const today = new Date('2024-01-01');
      const age12 = '2012-01-01';
      expect(isDobTooYoung(age12, today)).toBe(true);
    });

    it('should return false for ages over the minimum age limit', () => {
      const today = new Date('2024-01-01');
      const age30 = '1980-01-01';
      expect(isDobTooYoung(age30, today)).toBe(false);
    });
  });

  describe('isInTheFuture', () => {
    it('should return true for future dates', () => {
      const today = new Date('2024-01-01');
      const futureDate = '2024-01-02';
      expect(isDobInTheFuture(futureDate, today)).toBe(true);
    });

    it('should return false for past dates', () => {
      const today = new Date('2024-01-01');
      const pastDate = '2023-01-01';
      expect(isDobInTheFuture(pastDate, today)).toBe(false);
    });
  });

  describe('isDob', () => {
    it('should return false for invalid dates', () => {
      const today = new Date('2024-01-01');
      const invalidDate = '2024-13-01';
      expect(isDob(invalidDate, today)).toBe(false);
    });

    it('should return false for future dates', () => {
      const today = new Date('2024-01-01');
      const futureDate = '2024-01-02';
      expect(isDob(futureDate, today)).toBe(false);
    });

    it('should return false for ages over the maximum age limit', () => {
      const today = new Date('2024-01-01');
      const age200 = '1824-01-01';
      expect(isDob(age200, today)).toBe(false);
    });

    it('should return false for ages under the minimum age limit', () => {
      const today = new Date('2024-01-01');
      const age12 = '2012-01-01';
      expect(isDob(age12, today)).toBe(false);
    });

    it('should return true for valid dates', () => {
      const today = new Date('2024-01-01');
      const age30 = '1994-01-01';
      expect(isDob(age30, today)).toBe(true);
    });
  });
});

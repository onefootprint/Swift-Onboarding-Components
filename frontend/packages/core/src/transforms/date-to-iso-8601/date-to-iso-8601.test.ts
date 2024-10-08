import transformDateStringToISO8601 from './date-to-iso-8601';

describe('transformDateStringToISO8601', () => {
  describe('valid date strings', () => {
    it('should convert to ISO 8601 format correctly', () => {
      const dateStrings = [
        { input: '04/16/1990', expected: '1990-04-16' },
        { input: '12/31/2020', expected: '2020-12-31' },
        { input: '1/1/2000', expected: '2000-01-01' },
        { input: '11/21/1985', expected: '1985-11-21' },
      ];

      dateStrings.forEach(({ input, expected }) => {
        expect(transformDateStringToISO8601(input)).toBe(expected);
      });
    });
  });

  describe('invalid date strings', () => {
    it('should throw error', () => {
      const invalidDateStrings = ['02/35/2020'];

      invalidDateStrings.forEach(dateString => {
        expect(transformDateStringToISO8601(dateString)).toBe(undefined);
      });
    });
  });
});

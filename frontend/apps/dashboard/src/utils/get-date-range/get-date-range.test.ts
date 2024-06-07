import getDateRange from './get-date-range';

describe('getDateRange', () => {
  describe('when there is no date range', () => {
    it('returns an empty object', () => {
      expect(getDateRange()).toEqual({ from: undefined, to: undefined });
    });
  });

  describe('when the period is today', () => {
    it('returns the start of today', () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      expect(getDateRange(['today'], now)).toEqual({
        from: today,
        to: undefined,
      });
    });
  });
});

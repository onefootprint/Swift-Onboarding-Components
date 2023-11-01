import { OrgMetricsDateRange } from '../../home.types';
import getDateRange from './get-date-range';

describe('getDateRange', () => {
  describe('when the date range is all time', () => {
    it('returns an empty object', () => {
      expect(getDateRange(OrgMetricsDateRange.allTime)).toEqual({
        timestamp_gte: undefined,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is the current month', () => {
    it('returns the start and end of current month', () => {
      const now = new Date();
      const monthFirst = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthLast = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      expect(getDateRange(OrgMetricsDateRange.monthToDate)).toEqual({
        timestamp_gte: monthFirst.toISOString(),
        timestamp_lte: monthLast.toISOString(),
      });
    });
  });

  describe('when the date range is the previous month', () => {
    it('returns the start and end of previous month', () => {
      const now = new Date();
      const monthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthLast = new Date(now.getFullYear(), now.getMonth(), 0);

      expect(getDateRange(OrgMetricsDateRange.previousMonth)).toEqual({
        timestamp_gte: monthFirst.toISOString(),
        timestamp_lte: monthLast.toISOString(),
      });
    });
  });
});

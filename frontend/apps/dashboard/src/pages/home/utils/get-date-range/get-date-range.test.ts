import { OrgMetricsDateRange } from '../../home.types';
import getDateRange from './get-date-range';

describe('getDateRange', () => {
  describe('when the date range is today', () => {
    it('returns the start of today', () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      expect(getDateRange(OrgMetricsDateRange.today)).toEqual({
        timestamp_gte: today,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is last 7 days', () => {
    it('returns the start of a week ago', () => {
      const now = new Date();
      const lastWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );

      expect(getDateRange(OrgMetricsDateRange.last7Days)).toEqual({
        timestamp_gte: lastWeek,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is last 4 weeks', () => {
    it('returns the start of 4 weeks ago', () => {
      const now = new Date();
      const last4Weeks = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 28,
      );

      expect(getDateRange(OrgMetricsDateRange.last4Weeks)).toEqual({
        timestamp_gte: last4Weeks,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is last 3 months', () => {
    it('returns the start of 3 months ago', () => {
      const now = new Date();
      const last3Months = new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate(),
      );

      expect(getDateRange(OrgMetricsDateRange.last3Months)).toEqual({
        timestamp_gte: last3Months,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is last 12 months', () => {
    it('returns the start of a year ago', () => {
      const now = new Date();
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );

      expect(getDateRange(OrgMetricsDateRange.last12Months)).toEqual({
        timestamp_gte: lastYear,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is month to date', () => {
    it('returns the start of current month', () => {
      const now = new Date();
      const monthFirst = new Date(now.getFullYear(), now.getMonth(), 1);

      expect(getDateRange(OrgMetricsDateRange.monthToDate)).toEqual({
        timestamp_gte: monthFirst,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is quarter to date', () => {
    it('returns the start of three months ago', () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const firstOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);

      expect(getDateRange(OrgMetricsDateRange.quarterToDate)).toEqual({
        timestamp_gte: firstOfQuarter,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is year to date', () => {
    it('returns the start of three months ago', () => {
      const now = new Date();
      const firstOfYear = new Date(now.getFullYear(), 0, 1);

      expect(getDateRange(OrgMetricsDateRange.yearToDate)).toEqual({
        timestamp_gte: firstOfYear,
        timestamp_lte: undefined,
      });
    });
  });

  describe('when the date range is all time', () => {
    it('returns an empty object', () => {
      expect(getDateRange(OrgMetricsDateRange.allTime)).toEqual({
        timestamp_gte: undefined,
        timestamp_lte: undefined,
      });
    });
  });
});

import { OrgMetricsDateRange } from '../../home.types';

const getDateRange = (dateRange?: OrgMetricsDateRange) => {
  const now = new Date();

  if (dateRange === OrgMetricsDateRange.today) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { timestamp_gte: today, timestamp_lte: undefined };
  }

  if (dateRange === OrgMetricsDateRange.last7Days) {
    const lastWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7,
    );
    return { timestamp_gte: lastWeek, timestamp_lte: undefined };
  }

  if (dateRange === OrgMetricsDateRange.last4Weeks) {
    const last4Weeks = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 28,
    );
    return { timestamp_gte: last4Weeks, timestamp_lte: undefined };
  }

  if (dateRange === OrgMetricsDateRange.last3Months) {
    const last3Months = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      now.getDate(),
    );
    return { timestamp_gte: last3Months, timestamp_lte: undefined };
  }

  if (dateRange === OrgMetricsDateRange.last12Months) {
    const lastYear = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );
    return { timestamp_gte: lastYear, timestamp_lte: undefined };
  }

  if (dateRange === OrgMetricsDateRange.monthToDate) {
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { timestamp_gte: firstOfMonth, timestamp_lte: undefined };
  }

  if (dateRange === OrgMetricsDateRange.quarterToDate) {
    const quarter = Math.floor(now.getMonth() / 3);
    const firstOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
    return { timestamp_gte: firstOfQuarter, timestamp_lte: undefined };
  }

  if (dateRange === OrgMetricsDateRange.yearToDate) {
    const firstOfYear = new Date(now.getFullYear(), 0, 1);
    return { timestamp_gte: firstOfYear, timestamp_lte: undefined };
  }

  return { timestamp_gte: undefined, timestamp_lte: undefined };
};

export default getDateRange;

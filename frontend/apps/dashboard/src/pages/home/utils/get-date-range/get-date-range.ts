import { OrgMetricsDateRange } from '../../home.types';

const getDateRange = (dateRange?: OrgMetricsDateRange) => {
  if (dateRange === OrgMetricsDateRange.allTime) {
    return { timestamp_gte: undefined, timestamp_lte: undefined };
  }

  const now = new Date();
  let monthFirst = new Date(now.getFullYear(), now.getMonth(), 1);
  let monthLast = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  if (dateRange === OrgMetricsDateRange.previousMonth) {
    monthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    monthLast = new Date(now.getFullYear(), now.getMonth(), 0);
  }

  return {
    timestamp_gte: monthFirst.toISOString(),
    timestamp_lte: monthLast.toISOString(),
  };
};

export default getDateRange;

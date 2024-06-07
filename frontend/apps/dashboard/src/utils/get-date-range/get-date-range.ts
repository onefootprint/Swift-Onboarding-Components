import { FilterDateRange } from '@onefootprint/ui';

const getDateRange = (dateRange?: string | string[], now = new Date()) => {
  if (!dateRange || dateRange.length === 0) {
    return { from: undefined, to: undefined };
  }

  const isRange = dateRange.length === 2;
  if (isRange) {
    const [from, to] = dateRange;
    return { from, to };
  }

  const [period] = dateRange;
  if (period === FilterDateRange.AllTime) {
    return { from: undefined, to: undefined };
  }

  if (period === FilterDateRange.Today) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    return { from: today, to: undefined };
  }

  if (period === FilterDateRange.Last7Days) {
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return { from: lastWeek, to: undefined };
  }

  if (period === FilterDateRange.Last30Days) {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return { from: lastMonth, to: undefined };
  }
  return { from: undefined, to: undefined };
};

export default getDateRange;

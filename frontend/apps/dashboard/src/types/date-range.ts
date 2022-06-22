export enum DateRange {
  allTime = 'allTime',
  today = 'today',
  currentMonth = 'currentMonth',
  lastWeek = 'lastWeek',
  lastMonth = 'lastMonth',
  // TODO support custom date range
  // https://linear.app/footprint/issue/FP-398/support-custom-timestamp-filtering
}

export const dateRangeToDisplayText = {
  [DateRange.allTime]: 'All time',
  [DateRange.today]: 'Today',
  [DateRange.currentMonth]: 'Current month',
  [DateRange.lastWeek]: 'Last week',
  [DateRange.lastMonth]: 'Last month',
};

export const dateRangeToFilterParams = (dateRange: DateRange) => {
  const now = new Date();
  switch (dateRange) {
    case DateRange.allTime:
      return {};
    case DateRange.today: {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { timestampGte: today };
    }
    case DateRange.currentMonth: {
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { timestampGte: thisMonth };
    }
    case DateRange.lastWeek: {
      const lastWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );
      return { timestampGte: lastWeek };
    }
    case DateRange.lastMonth: {
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      );
      return { timestampGte: lastMonth };
    }
    default:
      return {};
  }
};

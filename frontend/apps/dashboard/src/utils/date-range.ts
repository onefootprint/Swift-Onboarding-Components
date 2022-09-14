import { DateRange } from 'types';

type DateRangeQuery = {
  dateRange?: string;
};

export const dateRangeToFilterParams = (query: DateRangeQuery) => {
  const [dateRange, customStartDate, customEndDate] = getDateRange(query);
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
    case DateRange.custom: {
      return {
        timestampGte: new Date(customStartDate!),
        timestampLte: new Date(customEndDate!),
      };
    }
    default:
      return {};
  }
};

type ParsedDateRange = [DateRange, string | undefined, string | undefined];

export const getDateRange = (req: DateRangeQuery) => {
  const dateRangeStr = req.dateRange || '';
  let dateRange: DateRange;
  let customDateStart: string | undefined;
  let customDateEnd: string | undefined;
  if (dateRangeStr === '') {
    dateRange = DateRange.allTime;
  } else if (dateRangeStr.startsWith('custom')) {
    dateRange = DateRange.custom;
    customDateStart = dateRangeStr.substring(
      dateRangeStr.indexOf('(') + 1,
      dateRangeStr.indexOf(','),
    );
    customDateEnd = dateRangeStr.substring(
      dateRangeStr.indexOf(',') + 1,
      dateRangeStr.indexOf(')'),
    );
  } else {
    dateRange = dateRangeStr as DateRange;
  }
  return [dateRange, customDateStart, customDateEnd] as ParsedDateRange;
};

// Serialize allTime date range as nothing for a cleaner querystring
export const serializeDateRange = (
  dateRange: DateRange,
  customDateStart?: string,
  customDateEnd?: string,
) => {
  switch (dateRange) {
    case DateRange.allTime:
      return undefined;
    case DateRange.custom:
      return `custom(${customDateStart},${customDateEnd})`;
    default:
      return dateRange;
  }
};

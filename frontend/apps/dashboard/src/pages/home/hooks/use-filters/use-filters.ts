import {
  startOfMonth,
  startOfQuarter,
  startOfToday,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import useBaseFilters from 'src/hooks/use-filters';

import type { DateFilterPeriod } from '../../components/date-filter/date-filter.types';
import { DEFAULT_DATE_FILTER_PERIOD } from '../../components/date-filter/date-filter.types';

export type OrgMetricsQuery = {
  playbook_id?: string;
  period: DateFilterPeriod;
  period_date_start?: string;
  period_date_end?: string;
};

const defaultQueryParams: OrgMetricsQuery = {
  playbook_id: undefined,
  period: DEFAULT_DATE_FILTER_PERIOD,
  period_date_start: undefined,
  period_date_end: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<OrgMetricsQuery>(defaultQueryParams);
  const { start, end } = getDates({
    period: filters.query.period,
    start: filters.query.period_date_start,
    end: filters.query.period_date_end,
  });

  const values = {
    period: filters.query.period,
    period_date_start: start,
    period_date_end: end,
    playbook_id: filters.query.playbook_id,
  };

  const requestParams = {
    playbook_id: values.playbook_id,
    timestamp_gte: start,
    timestamp_lte: end,
  };

  return {
    ...filters,
    requestParams,
    values,
  };
};

const today = new Date();
const oldDate = new Date(0);

const getDates = ({
  period,
  start,
  end,
}: {
  period: DateFilterPeriod;
  start?: string;
  end?: string;
}) => {
  if (period === 'today') {
    return {
      start: startOfToday(),
      end: today,
    };
  }
  if (period === 'last-7-days') {
    return {
      start: subDays(today, 7),
      end: today,
    };
  }
  if (period === 'last-4-weeks') {
    return {
      start: subDays(today, 28),
      end: today,
    };
  }
  if (period === 'last-3-months') {
    return {
      start: subMonths(today, 3),
      end: today,
    };
  }
  if (period === 'last-12-months') {
    return {
      start: subMonths(today, 12),
      end: today,
    };
  }
  if (period === 'month-to-date') {
    return {
      start: subMonths(today, 1),
      end: today,
    };
  }
  if (period === 'quarter-to-date') {
    return {
      start: startOfQuarter(today),
      end: today,
    };
  }
  if (period === 'year-to-date') {
    return {
      start: startOfYear(today),
      end: today,
    };
  }
  if (period === 'all-time') {
    return {
      start: oldDate,
      end: today,
    };
  }
  if (period === 'custom' && start && end) {
    return {
      start: new Date(start),
      end: new Date(end),
    };
  }
  return {
    start: startOfMonth(today),
    end: today,
  };
};

export default useFilters;

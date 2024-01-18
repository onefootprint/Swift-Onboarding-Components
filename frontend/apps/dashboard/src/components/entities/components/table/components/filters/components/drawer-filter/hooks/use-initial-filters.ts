import { useMemo } from 'react';

import useFilters from '../../../../../../../hooks/use-filters';
import type { Filters } from '../drawer-filter.type';
import { FiltersDateRange } from '../drawer-filter.type';

const useInitialFilters = (now = new Date()) => {
  const { requestParams, values } = useFilters();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7,
  );

  const initialValues = {
    labels: [],
    others: [],
    period: 'all-time',
    customDate: { from: today, to: nextWeek },
  };

  const defaultValues = useMemo(() => {
    const defaultData: Filters = {
      labels: [],
      others: [],
      ...getFormDefaultValue(values.dateRange, { from: today, to: nextWeek }),
    };
    if (requestParams.labels) {
      defaultData.labels = values.labels;
    }
    if (defaultData.others) {
      if (requestParams.watchlist_hit) {
        defaultData.others.push('watchlist_hit');
      }
      if (requestParams.has_outstanding_workflow_request) {
        defaultData.others.push('has_outstanding_workflow_request');
      }
      if (requestParams.show_unverified) {
        defaultData.others.push('show_unverified');
      }
    }
    return defaultData;
  }, []);

  return { initialValues, defaultValues };
};

const getFormDefaultValue = (
  selectedOptions: string[],
  defaultCustomDate: {
    from: Date;
    to: Date;
  },
): {
  period: string;
  customDate: {
    from: Date;
    to: Date;
  };
} => {
  const isEmpty = selectedOptions.length === 0;
  if (isEmpty) {
    return {
      period: FiltersDateRange.AllTime,
      customDate: defaultCustomDate,
    };
  }

  const isRange = selectedOptions.length === 2;
  if (isRange) {
    const [from, to] = selectedOptions;
    return {
      period: FiltersDateRange.Custom,
      customDate: {
        from: new Date(from),
        to: new Date(to),
      },
    };
  }

  const [period] = selectedOptions;
  return {
    period,
    customDate: defaultCustomDate,
  };
};

export default useInitialFilters;

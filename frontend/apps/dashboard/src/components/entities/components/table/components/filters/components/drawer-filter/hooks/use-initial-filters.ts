import { useMemo } from 'react';

import useFilters from '../../../../../../../hooks/use-filters';
import type { Filters, FormData } from '../drawer-filter.type';
import { FiltersDateRange } from '../drawer-filter.type';

const useInitialFilters = (now = new Date()) => {
  const { requestParams, values } = useFilters();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7,
  );

  const initialValues: FormData = {
    labels: [],
    others: [],
    period: 'all-time',
    customDate: { from: today, to: nextWeek },
    playbooks: {},
  };

  const defaultValues = useMemo(() => {
    const defaultData: Filters = {
      labels: [],
      others: [],
      playbooks: {},
      ...getFormDefaultValue(values.dateRange, { from: today, to: nextWeek }),
    };
    if (requestParams.labels) {
      defaultData.labels = values.labels;
    }
    if (requestParams.playbook_ids) {
      defaultData.playbooks = requestParams.playbook_ids.reduce(
        (acc, id) => {
          acc[id] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );
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
  }, [values]);

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

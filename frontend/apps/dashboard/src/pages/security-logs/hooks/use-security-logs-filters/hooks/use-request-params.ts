import { useMemo } from 'react';
import getDateRange from 'src/utils/get-date-range';

import { SecurityLogsFilterValues } from '../use-security-logs-filters.types';

const useRequestParams = ({
  dateRange,
  dataAttributes,
  search,
}: SecurityLogsFilterValues) => {
  const requestParams = useMemo(() => {
    const params: Record<string, any> = {
      kind: 'decrypt',
    };
    if (dateRange.length) {
      const { from, to } = getDateRange(dateRange);
      if (from) {
        params.timestamp_gte = from;
      }
      if (to) {
        params.timestamp_lte = to;
      }
    }
    if (search) {
      params.search = search;
    }
    if (dataAttributes.length) {
      params.targets = dataAttributes.join();
    }
    return params;
  }, [dateRange, search, dataAttributes]);

  return requestParams;
};

export default useRequestParams;

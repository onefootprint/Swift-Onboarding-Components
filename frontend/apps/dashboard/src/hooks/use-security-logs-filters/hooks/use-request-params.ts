import { useMemo } from 'react';
import getDateRange from 'src/utils/get-date-range';

import type { SecurityLogsFilterValues } from '../use-security-logs-filters.types';

const useRequestParams = ({
  dateRange,
  dataAttributesBusiness,
  dataAttributesPersonal,
  search,
  names,
}: SecurityLogsFilterValues) => {
  const requestParams = useMemo(() => {
    const params: Record<string, unknown> = {};
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
    if (dataAttributesBusiness.length || dataAttributesPersonal.length) {
      const mergedAttrs = [...dataAttributesBusiness, ...dataAttributesPersonal];
      params.targets = mergedAttrs.join();
    }
    if (names.length) {
      params.names = names.join();
    }
    return params;
  }, [dateRange, search, dataAttributesBusiness, dataAttributesPersonal, names]);

  return requestParams;
};

export default useRequestParams;

import useBaseFilters from 'src/hooks/use-filters';

import { OrgMetricsDateRange } from '../../home.types';
import getDateRange from '../../utils/get-date-range';

export type OrgMetricsQuery = {
  dateRange?: OrgMetricsDateRange;
};

const defaultQueryParams: OrgMetricsQuery = {
  dateRange: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<OrgMetricsQuery>(defaultQueryParams);
  const values = {
    dateRange: filters.query.dateRange ?? OrgMetricsDateRange.monthToDate,
  };
  const timestamps = getDateRange(values.dateRange);
  const requestParams = {
    timestamp_gte: timestamps.timestamp_gte,
    timestamp_lte: timestamps.timestamp_lte,
  };

  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;

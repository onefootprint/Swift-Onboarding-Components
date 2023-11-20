import useBaseFilters from 'src/hooks/use-filters';

import { OrgMetricsDateRange } from '../../home.types';
import getDateRange from '../../utils/get-date-range';

export type OrgMetricsQuery = {
  playbook_id?: string;
  date_range?: OrgMetricsDateRange;
};

const defaultQueryParams: OrgMetricsQuery = {
  playbook_id: undefined,
  date_range: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<OrgMetricsQuery>(defaultQueryParams);
  const values = {
    playbook_id: filters.query.playbook_id,
    date_range: filters.query.date_range ?? OrgMetricsDateRange.monthToDate,
  };
  const timestamps = getDateRange(values.date_range);
  const requestParams = {
    playbook_id: values.playbook_id,
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

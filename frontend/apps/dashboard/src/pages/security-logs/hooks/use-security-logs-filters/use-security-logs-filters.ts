import useFilters from 'src/hooks/use-filters';

import useFilterValues from './hooks/use-filter-values';
import useRequestParams from './hooks/use-request-params';
import type { SecurityLogsQueryString } from './use-security-logs-filters.types';

const defaultQueryString = {
  data_attributes_business: undefined,
  data_attributes_personal: undefined,
  date_range: undefined,
  search: undefined,
};

const useSecurityLogsFilters = () => {
  const filters = useFilters<SecurityLogsQueryString>(defaultQueryString);
  const values = useFilterValues(filters.query);
  const requestParams = useRequestParams(values);

  return {
    isReady: filters.isReady,
    clear: filters.clear,
    push: filters.push,
    query: filters.query,
    requestParams,
    values,
  };
};

export default useSecurityLogsFilters;

import useFilters from 'src/hooks/use-filters';

import useFilterValues from './hooks/use-filter-values';
import type { ListDetailsFilterValues, ListDetailsQueryString } from './use-list-details-filters.types';

const defaultQueryString: ListDetailsQueryString = {
  search: undefined,
};

const useListDetailsFilters = () => {
  const filters = useFilters<ListDetailsFilterValues>(defaultQueryString);
  const values = useFilterValues(filters.query);

  return {
    isReady: filters.isReady,
    clear: filters.clear,
    push: filters.push,
    query: filters.query,
    values,
  };
};

export default useListDetailsFilters;

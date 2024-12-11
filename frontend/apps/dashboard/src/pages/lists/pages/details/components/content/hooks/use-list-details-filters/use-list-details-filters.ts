import { useMemo } from 'react';
import useFilters from 'src/hooks/use-filters';
import type { ListDetailsFilterValues, ListDetailsQueryString } from './use-list-details-filters.types';

const defaultQueryString: ListDetailsQueryString = {
  search: undefined,
};

const useListDetailsFilters = () => {
  const filters = useFilters<ListDetailsFilterValues>(defaultQueryString);

  const values = useMemo(() => {
    const search = filters.query.search || '';
    return {
      search,
    };
  }, [filters.query.search]);

  return {
    isReady: filters.isReady,
    clear: filters.clear,
    push: filters.push,
    query: filters.query,
    values,
  };
};

export default useListDetailsFilters;

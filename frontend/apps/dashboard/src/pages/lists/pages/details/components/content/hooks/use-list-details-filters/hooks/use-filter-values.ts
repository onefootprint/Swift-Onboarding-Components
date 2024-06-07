import { useMemo } from 'react';

import type { ListDetailsFilterValues, ListDetailsQueryString } from '../use-list-details-filters.types';

const useFilterValues = (query: ListDetailsQueryString): ListDetailsFilterValues => {
  const filterValues = useMemo(() => {
    const search = query.search || '';

    return {
      search,
    };
  }, [query.search]);
  return filterValues;
};

export default useFilterValues;

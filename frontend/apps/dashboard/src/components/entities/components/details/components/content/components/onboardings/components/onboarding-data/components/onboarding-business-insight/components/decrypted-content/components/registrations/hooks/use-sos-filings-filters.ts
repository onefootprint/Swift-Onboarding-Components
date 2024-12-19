import { useMemo } from 'react';
import useFilters, { queryToArray } from 'src/hooks/use-filters';

export type SOSFilingsQueryParams = {
  filings_states?: string[];
};

const defaultQueryParams: SOSFilingsQueryParams = {
  filings_states: undefined,
};

const useSOSFilingsFilters = () => {
  const filters = useFilters<SOSFilingsQueryParams>(defaultQueryParams);

  const values = useMemo(
    () => ({
      states: queryToArray(filters.query.filings_states),
    }),
    [filters.query],
  );

  const filtersCount = useMemo(() => {
    let count = 0;
    if (values.states.length) {
      count += values.states.length;
    }
    return count;
  }, [values]);

  const hasFilters = filtersCount > 0;

  return {
    ...filters,
    filtersCount,
    hasFilters,
    values,
  };
};

export default useSOSFilingsFilters;

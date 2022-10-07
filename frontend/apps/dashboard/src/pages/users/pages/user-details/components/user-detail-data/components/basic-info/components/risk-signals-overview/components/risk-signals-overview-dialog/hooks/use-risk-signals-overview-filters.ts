import useFilters from 'src/hooks/use-filters';

export type SignalsQueryParams = {
  signal_id?: string;
};

const defaultQueryParams: SignalsQueryParams = {
  signal_id: undefined,
};

const useRiskSignalsOverviewFilters = () => {
  const filters = useFilters<SignalsQueryParams>(defaultQueryParams);

  return {
    push: filters.push,
    query: {
      signal_id: filters.query.signal_id,
    },
    reset: filters.reset,
  };
};

export default useRiskSignalsOverviewFilters;

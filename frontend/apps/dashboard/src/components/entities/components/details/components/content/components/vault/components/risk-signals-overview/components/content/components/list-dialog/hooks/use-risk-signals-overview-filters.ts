import useFilters from 'src/hooks/use-filters';

export type SignalsQueryParams = {
  risk_signal_id?: string;
};

const defaultQueryParams: SignalsQueryParams = {
  risk_signal_id: undefined,
};

const useRiskSignalsOverviewFilters = () => {
  const filters = useFilters<SignalsQueryParams>(defaultQueryParams);

  return {
    push: filters.push,
    query: {
      risk_signal_id: filters.query.risk_signal_id,
    },
    clear: filters.clear,
  };
};

export default useRiskSignalsOverviewFilters;

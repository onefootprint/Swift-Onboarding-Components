import useFilters, { countString } from 'src/hooks/use-filters';

export type SignalDetailsQueryParams = {
  signal_id?: string;
};

export type SignalListQueryParams = {
  signal_scope?: string;
  signal_description?: string;
  signal_severity?: string;
};

export type SignalsQueryParams = SignalDetailsQueryParams &
  SignalListQueryParams;

const defaultQueryParams: SignalsQueryParams = {
  signal_id: undefined,
  signal_scope: undefined,
  signal_description: undefined,
  signal_severity: undefined,
};

const useRiskSignalsFilters = () => {
  const filters = useFilters<SignalsQueryParams>(defaultQueryParams);
  const requestParams = {
    scope: filters.query.signal_scope,
    description: filters.query.signal_description,
    severity: filters.query.signal_severity,
  };

  const getFiltersCount = () => {
    const severity = countString(filters.query.signal_severity);
    const scope = countString(filters.query.signal_scope);
    return severity + scope;
  };

  return {
    count: getFiltersCount(),
    push: filters.push,
    query: {
      signal_id: filters.query.signal_id,
      signal_scope: filters.query.signal_scope,
      signal_description: filters.query.signal_description,
      signal_severity: filters.query.signal_severity,
    },
    reset: filters.reset,
    requestParams,
  };
};

export { stringToArray } from 'src/hooks/use-filters';

export default useRiskSignalsFilters;

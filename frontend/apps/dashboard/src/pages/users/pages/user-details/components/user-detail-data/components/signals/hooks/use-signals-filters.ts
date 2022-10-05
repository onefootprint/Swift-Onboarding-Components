import useFilters, { countString } from 'src/hooks/use-filters';

export type SignalDetailsQueryParams = {
  signal_id?: string;
};

export type SignalListQueryParams = {
  signal_note?: string;
  signal_scope?: string;
  signal_search?: string;
  signal_severity?: string;
};

export type SignalsQueryParams = SignalDetailsQueryParams &
  SignalListQueryParams;

const defaultQueryParams: SignalsQueryParams = {
  signal_id: undefined,
  signal_note: undefined,
  signal_scope: undefined,
  signal_search: undefined,
  signal_severity: undefined,
};

const useSignalFilters = () => {
  const filters = useFilters<SignalsQueryParams>(defaultQueryParams);

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
      signal_note: filters.query.signal_note,
      signal_scope: filters.query.signal_scope,
      signal_search: filters.query.signal_search,
      signal_severity: filters.query.signal_severity,
    },
    reset: filters.reset,
  };
};

export { stringToArray } from 'src/hooks/use-filters';

export default useSignalFilters;

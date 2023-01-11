import useFilters, { queryToArray, queryToString } from 'src/hooks/use-filters';

export type SignalDetailsQueryParams = {
  risk_signal_description?: string;
  risk_signal_id?: string;
  risk_signal_scope?: string;
  risk_signal_severity?: string;
};

const defaultQueryParams: SignalDetailsQueryParams = {
  risk_signal_description: undefined,
  risk_signal_id: undefined,
  risk_signal_scope: undefined,
  risk_signal_severity: undefined,
};

const useRiskSignalsFilters = () => {
  const filters = useFilters<SignalDetailsQueryParams>(defaultQueryParams);
  const values = {
    description: filters.query.risk_signal_description,
    scope: queryToArray(filters.query.risk_signal_scope),
    severity: queryToArray(filters.query.risk_signal_severity),
  };
  const requestParams = {
    description: values.description,
    scope: queryToString(values.scope),
    severity: queryToString(values.severity),
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useRiskSignalsFilters;

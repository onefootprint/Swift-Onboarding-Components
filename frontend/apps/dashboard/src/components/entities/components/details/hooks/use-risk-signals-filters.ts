import useFilters, { queryToArray, queryToString, queryToBoolean } from 'src/hooks/use-filters';

export type SignalDetailsQueryParams = {
  risk_signal_description?: string;
  risk_signal_id?: string;
  risk_signal_scope?: string;
  risk_signal_severity?: string;
  is_sentilink?: string;
};

const defaultQueryParams: SignalDetailsQueryParams = {
  risk_signal_description: undefined,
  risk_signal_id: undefined,
  risk_signal_scope: undefined,
  risk_signal_severity: undefined,
  is_sentilink: undefined,
};

const useRiskSignalsFilters = () => {
  const filters = useFilters<SignalDetailsQueryParams>(defaultQueryParams);
  const isSentilink = queryToBoolean(filters.query.is_sentilink);
  const values = {
    description: filters.query.risk_signal_description,
    scope: queryToArray(filters.query.risk_signal_scope),
    severity: queryToArray(filters.query.risk_signal_severity),
    riskSignalId: filters.query.risk_signal_id,
    isSentilink,
    sentilinkRiskSignalId: isSentilink ? filters.query.risk_signal_id : undefined,
  };
  const requestParams = {
    description: values.description,
    scope: queryToString(values.scope),
    severity: queryToString(values.severity),
    is_sentilink: values.isSentilink?.toString(),
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useRiskSignalsFilters;

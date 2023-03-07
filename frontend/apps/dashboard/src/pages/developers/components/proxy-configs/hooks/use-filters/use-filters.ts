import useBaseFilters from 'src/hooks/use-filters';

export type ProxyConfigsQuery = {
  proxy_config_id?: string;
};

const defaultQueryParams: ProxyConfigsQuery = {
  proxy_config_id: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<ProxyConfigsQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    id: query.proxy_config_id,
  };
  const requestParams = {
    id: values.id,
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;

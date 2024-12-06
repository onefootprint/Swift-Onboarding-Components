import useBaseFilters from 'src/hooks/use-filters';

export type ListConfigQuery = {
  id?: string;
};

const defaultQueryParams: ListConfigQuery = {
  id: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<ListConfigQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    id: query.id,
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

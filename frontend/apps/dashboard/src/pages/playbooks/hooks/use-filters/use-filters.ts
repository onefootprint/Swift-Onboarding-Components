import useBaseFilters from 'src/hooks/use-filters';
import type { PlaybooksConfigQuery } from '../../utils/schema/schema';

const defaultQueryParams: PlaybooksConfigQuery = {
  id: undefined,
  kind: undefined,
  page: undefined,
  search: undefined,
  status: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<PlaybooksConfigQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    id: query.id,
    page: query.page ? Number.parseInt(query.page, 10) : 0,
    search: query.search,
    status: query.status,
  };
  const requestParams = {
    page: values.page,
    search: values.search,
    status: values.status,
  };

  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;

import useFilters from 'src/hooks/use-filters';

export type RolesQuery = {
  roles_search?: string;
  roles_page?: string;
  roles_page_size?: string;
};

const defaultQueryParams: RolesQuery = {
  roles_search: undefined,
  roles_page: undefined,
  roles_page_size: undefined,
};

const useRolesFilters = () => {
  const filters = useFilters<RolesQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    page: query.roles_page ? Number.parseInt(query.roles_page, 10) : 0,
    pageSize: query.roles_page_size,
    search: query.roles_search,
  };
  const requestParams = {
    page: values.page,
    pageSize: values.pageSize,
    search: values.search,
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useRolesFilters;

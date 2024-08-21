import useBaseFilters from 'src/hooks/use-filters';

export type TenantsQuery = {
  tenants_page?: string;
  tenants_page_size?: string;
  tenants_search?: string;
};

const defaultQueryParams: TenantsQuery = {
  tenants_page: undefined,
  tenants_page_size: undefined,
  tenants_search: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<TenantsQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    page: query.tenants_page ? Number.parseInt(query.tenants_page, 10) : undefined,
    pageSize: 15,
    search: query.tenants_search || '',
  };
  const requestParams = {
    page: query.tenants_page,
    pageSize: 15,
    search: query.tenants_search,
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;

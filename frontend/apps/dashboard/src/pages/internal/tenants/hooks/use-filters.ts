import useBaseFilters from 'src/hooks/use-filters';

export type TenantsQuery = {
  tenants_page?: string;
  tenants_page_size?: string;
  tenants_search?: string;
  tenants_live_only?: string;
};

const defaultQueryParams: TenantsQuery = {
  tenants_page: undefined,
  tenants_page_size: undefined,
  tenants_search: undefined,
  tenants_live_only: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<TenantsQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    page: query.tenants_page ? Number.parseInt(query.tenants_page, 10) : undefined,
    pageSize: 15,
    search: query.tenants_search || '',
    liveOnly: query.tenants_live_only === 'true',
  };
  const requestParams = {
    page: query.tenants_page,
    pageSize: 15,
    search: query.tenants_search,
    isLive: query.tenants_live_only === 'true' || null,
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;

import { DEFAULT_PAGE_SIZE } from 'src/config/constants';
import useFilters, { queryToArray, queryToString } from 'src/hooks/use-filters';

export type RolesQuery = {
  roles_search?: string;
  roles_cursor?: string;
  roles_page_size?: string;
};

const defaultQueryParams: RolesQuery = {
  roles_search: undefined,
  roles_cursor: undefined,
  roles_page_size: undefined,
};

const useOrgMembersFilters = () => {
  const filters = useFilters<RolesQuery>(defaultQueryParams);
  const values = {
    cursor: queryToArray(filters.query.roles_cursor),
    pageSize: filters.query.roles_page_size || `${DEFAULT_PAGE_SIZE}`,
    search: filters.query.roles_search,
  };
  const requestParams = {
    cursor: queryToString(values.cursor),
    search: values.search,
    // pageSize: values.pageSize,
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useOrgMembersFilters;

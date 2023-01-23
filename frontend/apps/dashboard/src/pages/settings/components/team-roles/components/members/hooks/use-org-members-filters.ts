import { DEFAULT_PAGE_SIZE } from 'src/config/constants';
import useFilters, { queryToArray, queryToString } from 'src/hooks/use-filters';

export type MembersQuery = {
  member_search?: string;
  member_cursor?: string;
  member_page_size?: string;
};

const defaultQueryParams: MembersQuery = {
  member_search: undefined,
  member_cursor: undefined,
  member_page_size: undefined,
};

const useOrgMembersFilters = () => {
  const filters = useFilters<MembersQuery>(defaultQueryParams);
  const values = {
    cursor: queryToArray(filters.query.member_cursor),
    pageSize: filters.query.member_page_size || `${DEFAULT_PAGE_SIZE}`,
    search: filters.query.member_search,
  };
  const requestParams = {
    cursor: queryToString(values.cursor),
    search: values.search,
    pageSize: values.pageSize,
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useOrgMembersFilters;

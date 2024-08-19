import useFilters, { queryToArray, queryToString } from 'src/hooks/use-filters';

export type MembersQuery = {
  members_role?: string | string[];
  members_search?: string;
  members_page?: string;
  members_page_size?: string;
};

const defaultQueryParams: MembersQuery = {
  members_role: undefined,
  members_search: undefined,
  members_page: undefined,
  members_page_size: undefined,
};

const useMembersFilters = () => {
  const filters = useFilters<MembersQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    role: queryToArray(query.members_role),
    page: query.members_page ? parseInt(query.members_page, 10) : 0,
    pageSize: query.members_page_size,
    search: query.members_search,
  };
  const requestParams = {
    roleIds: queryToString(values.role),
    page: values.page,
    search: values.search,
    pageSize: values.pageSize,
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useMembersFilters;

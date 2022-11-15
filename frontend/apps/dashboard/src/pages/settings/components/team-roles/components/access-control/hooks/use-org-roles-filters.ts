import useFilters, { countString, stringToArray } from 'src/hooks/use-filters';

export type OrgRolesFilters = {
  permissions?: string;
  roles?: string;
  dateRange?: string;
};

export type OrgRolesQueryString = OrgRolesFilters & {
  // JSON serialized list of the cursors for all of the previous pages that have been visited.
  // When asking the backend for results, we use the cursor most recently put on the stack
  cursors?: string;
};

export const getCursors = (req?: OrgRolesQueryString) =>
  stringToArray(req?.cursors);

const useOrgRolesFilters = () => {
  const { query, push } = useFilters<OrgRolesQueryString>({});

  const getFiltersCount = () => {
    const { dateRange, permissions, roles } = query;
    return (
      countString(dateRange) + countString(permissions) + countString(roles)
    );
  };

  const setCursors = (cursors: string[]) => {
    push({ cursors: cursors.join(',') });
  };

  return {
    filtersCount: getFiltersCount(),
    filters: query as OrgRolesQueryString,
    setFilter: push,
    setCursors,
  };
};

export default useOrgRolesFilters;

import useFilters, { stringToArray } from 'src/hooks/use-filters';

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

  const setCursors = (cursors: string[]) => {
    push({ cursors: cursors.join(',') });
  };

  return {
    filters: query as OrgRolesQueryString,
    setFilter: push,
    setCursors,
  };
};

export default useOrgRolesFilters;

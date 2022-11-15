import useFilters, { countString, stringToArray } from 'src/hooks/use-filters';

export type OrgMembersFilters = {
  emails?: string;
  roles?: string;
  dateRange?: string;
};

export type OrgMembersQueryString = OrgMembersFilters & {
  // JSON serialized list of the cursors for all of the previous pages that have been visited.
  // When asking the backend for results, we use the cursor most recently put on the stack
  cursors?: string;
};

export const getCursors = (req?: OrgMembersQueryString) =>
  stringToArray(req?.cursors);

const useOrgMembersFilters = () => {
  const { query, push } = useFilters<OrgMembersQueryString>({});

  const getFiltersCount = () => {
    const { dateRange, emails, roles } = query;
    return countString(dateRange) + countString(emails) + countString(roles);
  };

  const setCursors = (cursors: string[]) => {
    push({ cursors: cursors.join(',') });
  };

  return {
    filtersCount: getFiltersCount(),
    filters: query as OrgMembersQueryString,
    setFilter: push,
    setCursors,
  };
};

export default useOrgMembersFilters;

import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import { useRouter } from 'next/router';

export type ScopedUserListFilters = {
  footprint_user_id?: string;
  statuses?: string;
  // Filter via secure hash of a piece of data belonging to a user.
  // By filtering on fingerprint, we select users that have a piece of data whose secure hash
  // _exactly_ matches the hash of this fingerprint.
  // For example, this can be used to filter exactly on name or email.
  fingerprint?: string;
  dateRange?: string;
};

export type ScopedUsersListQueryString = ScopedUserListFilters & {
  // JSON serialized list of the cursors for all of the previous pages that have been visited.
  // When asking the backend for results, we use the cursor most recently put on the stack
  cursors?: string;
};

export const getCursors = (req: ScopedUsersListQueryString) =>
  req.cursors ? req.cursors.split(',') : [];

const useUserFilters = () => {
  const router = useRouter();

  const getFiltersCount = () => {
    const getDateFiltersCount = () => (router.query.dateRange ? 1 : 0);

    const getStatusFiltersCount = () => {
      if (router.query.statuses && typeof router.query.statuses === 'string') {
        return router.query.statuses.split(',').length;
      }
      return 0;
    };

    return getDateFiltersCount() + getStatusFiltersCount();
  };

  const setQueryString = (query: ScopedUsersListQueryString) => {
    // Also clean up query params if values are empty
    router.push({ query: omitBy(query, x => !x) }, undefined, {
      shallow: true,
    });
  };
  const setFilter = (newQuery: ScopedUserListFilters) => {
    // Merge newQuery with the existing filters extracted from the current router querystring.
    // When we adjust filters, the result set will change, so we want to start on the first page.
    setQueryString({ ...omit(router.query, 'cursors'), ...newQuery });
  };
  const setCursors = (cursors: string[]) => {
    // When we set the cursors, keep the previous filter params and only replace the cursors
    setQueryString({ ...router.query, cursors: cursors.join(',') });
  };

  return {
    filtersCount: getFiltersCount(),
    filters: router.query as ScopedUsersListQueryString,
    setFilter,
    setCursors,
  };
};

export default useUserFilters;

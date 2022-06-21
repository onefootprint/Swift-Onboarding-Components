import { omitBy } from 'lodash';
import { useRouter } from 'next/router';

export type OnboardingListFilters = {
  footprint_user_id?: string;
  status?: string;
  // Filter via secure hash of a piece of data belonging to a user.
  // By filtering on fingerprint, we select users that have a piece of data whose secure hash
  // _exactly_ matches the hash of this fingerprint.
  // For example, this can be used to filter exactly on name or email.
  fingerprint?: string;
  // JSON serialized list of the cursors for all of the previous pages that have been visited.
  // When asking the backend for results, we use the cursor most recently put on the stack
  cursors?: string;
};

export const useFilters = () => {
  const router = useRouter();
  const setFilter = (newQuery: OnboardingListFilters) => {
    // Merge newQuery with the existing filters extracted from the current router querystring.
    // Also clean up query params if values are empty
    const mergedQuery = omitBy({ ...router.query, ...newQuery }, x => !x);
    router.push({ query: mergedQuery }, undefined, {
      shallow: true,
    });
  };
  return {
    query: router.query as OnboardingListFilters,
    setFilter,
  };
};

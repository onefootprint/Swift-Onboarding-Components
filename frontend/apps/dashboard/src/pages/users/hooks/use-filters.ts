import { omitBy } from 'lodash';
import { useRouter } from 'next/router';

export type OnboardingsListRequest = {
  status?: string;
  // Filter via secure hash of a piece of data belonging to a user.
  // By filtering on fingerprint, we select users that have a piece of data whose secure hash
  // _exactly_ matches the hash of this fingerprint.
  // For example, this can be used to filter exactly on name or email.
  fingerprint?: string;
};

export const useFilters = () => {
  const router = useRouter();
  const setFilter = (newQuery: OnboardingsListRequest) => {
    // Merge newQuery with the existing filters extracted from the current router querystring.
    // Also clean up query params if values are empty
    const mergedQuery = omitBy({ ...router.query, ...newQuery }, x => !x);
    router.push({ query: mergedQuery }, undefined, {
      shallow: true,
    });
  };
  return {
    query: router.query as OnboardingsListRequest,
    setFilter,
  };
};

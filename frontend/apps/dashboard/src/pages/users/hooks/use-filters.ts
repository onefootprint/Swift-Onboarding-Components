import { isNil, omitBy } from 'lodash';
import { useRouter } from 'next/router';

export type OnboardingsListRequest = {
  status?: string;
};

export const useFilters = () => {
  const router = useRouter();
  const setFilter = (newQuery: OnboardingsListRequest) => {
    // Merge newQuery with the existing filters extracted from the current router querystring.
    // Also clean up query params if values are empty
    const mergedQuery = omitBy({ ...router.query, ...newQuery }, isNil);
    router.push({ query: mergedQuery }, undefined, {
      shallow: true,
    });
  };
  return { query: router.query as OnboardingsListRequest, setFilter };
};

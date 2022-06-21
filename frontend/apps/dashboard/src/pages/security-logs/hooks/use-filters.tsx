import { omitBy } from 'lodash';
import { useRouter } from 'next/router';

export type AccessEventFilters = {
  // Need to store this as a stringified string in the query
  dataKinds?: string;
};

export const useFilters = () => {
  const router = useRouter();
  const setFilter = (newQuery: AccessEventFilters) => {
    // Merge newQuery with the existing filters extracted from the current router querystring.
    // Also clean up query params if values are empty
    const mergedQuery = omitBy(
      // When we adjust filters, erase cursors or page, unless they are in the newQuery
      { ...router.query, ...newQuery },
      x => !x,
    );
    router.push({ query: mergedQuery }, undefined, {
      shallow: true,
    });
  };
  return {
    filters: router.query as AccessEventFilters,
    setFilter,
  };
};

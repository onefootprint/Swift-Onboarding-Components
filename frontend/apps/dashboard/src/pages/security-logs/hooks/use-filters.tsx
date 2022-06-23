import { omitBy } from 'lodash';
import { useRouter } from 'next/router';
import { DateRange } from 'src/types';

export type AccessEventFilters = {
  // Need to store this as a stringified string in the query
  dataKinds?: string;
  dateRange?: string;
  search?: string;
};

export const getDateRange = (req: AccessEventFilters) => {
  const dateRangeStr = req.dateRange || '';
  return dateRangeStr in DateRange
    ? (dateRangeStr as DateRange)
    : DateRange.allTime;
};

export const useFilters = () => {
  const router = useRouter();
  const setFilter = (newQuery: AccessEventFilters) => {
    // Merge newQuery with the existing filters extracted from the current router querystring.
    // Also clean up query params if values are empty
    const mergedQuery = omitBy({ ...router.query, ...newQuery }, x => !x);
    router.push({ query: mergedQuery }, undefined, {
      shallow: true,
    });
  };
  return {
    filters: router.query as AccessEventFilters,
    setFilter,
  };
};

import { omit, omitBy } from 'lodash';
import { useRouter } from 'next/router';
import { DateRange } from 'src/types';

export type OnboardingListFilters = {
  footprint_user_id?: string;
  statuses?: string;
  // Filter via secure hash of a piece of data belonging to a user.
  // By filtering on fingerprint, we select users that have a piece of data whose secure hash
  // _exactly_ matches the hash of this fingerprint.
  // For example, this can be used to filter exactly on name or email.
  fingerprint?: string;
  dateRange?: string;
};

export type OnboardingListQuerystring = OnboardingListFilters & {
  // JSON serialized list of the cursors for all of the previous pages that have been visited.
  // When asking the backend for results, we use the cursor most recently put on the stack
  cursors?: string;
};

export const getCursors = (req: OnboardingListQuerystring) =>
  req.cursors ? req.cursors.split(',') : [];

export const getDateRange = (req: OnboardingListQuerystring) => {
  const dateRangeStr = req.dateRange || '';
  return dateRangeStr in DateRange
    ? (dateRangeStr as DateRange)
    : DateRange.allTime;
};

export const useFilters = () => {
  const router = useRouter();
  const setQuerystring = (query: OnboardingListQuerystring) => {
    // Also clean up query params if values are empty
    router.push({ query: omitBy(query, x => !x) }, undefined, {
      shallow: true,
    });
  };
  const setFilter = (newQuery: OnboardingListFilters) => {
    // Merge newQuery with the existing filters extracted from the current router querystring.
    // When we adjust filters, the result set will change, so we want to start on the first page.
    setQuerystring({ ...omit(router.query, 'cursors'), ...newQuery });
  };
  const setCursors = (cursors: string[]) => {
    // When we set the cursors, keep the previous filter params and only replace the cursors
    setQuerystring({ ...router.query, cursors: cursors.join(',') });
  };
  return {
    query: router.query as OnboardingListQuerystring,
    setFilter,
    setCursors,
  };
};

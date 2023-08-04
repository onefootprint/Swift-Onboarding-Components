import last from 'lodash/last';
import useBaseFilters, {
  getSearchParams,
  queryToArray,
  queryToString,
} from 'src/hooks/use-filters';
import getDateRange from 'src/utils/get-date-range';

export type EntitiesQueryParams = {
  status?: string | string[];
  date_range?: string | string[];
  watchlist_hit?: string;
  search?: string;
  cursor?: string;
  page_size?: string;
  // this is a boolean but we need to pass as a string for URL; incompatible w/ index signature otherwise
  requires_manual_review?: string;
};

const defaultQueryParams: EntitiesQueryParams = {
  status: undefined,
  date_range: undefined,
  search: undefined,
  cursor: undefined,
  page_size: undefined,
  watchlist_hit: undefined,
  requires_manual_review: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<EntitiesQueryParams>(defaultQueryParams);
  const values = {
    cursor: queryToArray(filters.query.cursor),
    dateRange: queryToArray(filters.query.date_range),
    pageSize: filters.query.page_size || 15,
    search: filters.query.search,
    status: queryToArray(filters.query.status),
    watchlist_hit: filters.query.watchlist_hit,
    requires_manual_review: filters.query.requires_manual_review,
  };
  const { from, to } = getDateRange(values.dateRange);
  const requestParams = {
    cursor: last(values.cursor),
    search: values.search,
    page_size: values.pageSize,
    statuses: queryToString(values.status),
    timestamp_gte: from,
    timestamp_lte: to,
    watchlist_hit: values.watchlist_hit,
    requires_manual_review: values.requires_manual_review,
  };
  const searchParams = getSearchParams({
    cursor: filters.query.cursor,
    dateRange: filters.query.date_range,
    pageSize: filters.query.page_size,
    search: filters.query.search,
    status: filters.query.status,
    watchlist_hit: filters.query.watchlist_hit,
    requires_manual_review: filters.query.requires_manual_review,
  });
  return {
    ...filters,
    searchParams,
    requestParams,
    values,
  };
};

export default useFilters;

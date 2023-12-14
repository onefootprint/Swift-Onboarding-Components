import { EntityStatus } from '@onefootprint/types';
import last from 'lodash/last';
import useBaseFilters, {
  getSearchParams,
  queryToArray,
  queryToString,
} from 'src/hooks/use-filters';
import getDateRange from 'src/utils/get-date-range';

export type EntitiesQueryParams = {
  state?: string;
  verification?: string;
  date_range?: string | string[];
  watchlist_hit?: string;
  search?: string;
  cursor?: string;
  page_size?: string;
  // this is a boolean but we need to pass as a string for URL; incompatible w/ index signature otherwise
  requires_manual_review?: string;
  // this is a boolean but we need to pass as a string for URL; incompatible w/ index signature otherwise
  has_outstanding_workflow_request?: string;
  show_unverified?: string;
};

const defaultQueryParams: EntitiesQueryParams = {
  state: undefined,
  verification: undefined,
  date_range: undefined,
  search: undefined,
  cursor: undefined,
  page_size: undefined,
  watchlist_hit: undefined,
  requires_manual_review: undefined,
  has_outstanding_workflow_request: undefined,
  show_unverified: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<EntitiesQueryParams>(defaultQueryParams);

  const getStatusAndManualReviewParams = (
    state?: string,
    verification?: string,
  ) => {
    if (!state && !verification) {
      return {};
    }
    if (state === EntityStatus.incomplete) {
      return {
        statuses: queryToString([
          EntityStatus.incomplete,
          EntityStatus.pending,
        ]),
        requiresManualReview: false,
      };
    }
    if (!verification) {
      return {
        statuses: queryToString([
          EntityStatus.pass,
          EntityStatus.failed,
          EntityStatus.none,
        ]),
        requiresManualReview: false,
      };
    }
    if (verification === EntityStatus.manualReview) {
      return {
        statuses: undefined,
        requiresManualReview: true,
      };
    }
    return {
      statuses: verification,
      requiresManualReview: false,
    };
  };

  const values = {
    state: filters.query.state,
    verification: filters.query.verification,
    cursor: queryToArray(filters.query.cursor),
    dateRange: queryToArray(filters.query.date_range),
    pageSize: filters.query.page_size
      ? parseInt(filters.query.page_size, 10)
      : 15,
    search: filters.query.search,
    watchlist_hit: filters.query.watchlist_hit,
    has_outstanding_workflow_request:
      filters.query.has_outstanding_workflow_request,
    show_unverified: filters.query.show_unverified,
  };
  const { from, to } = getDateRange(values.dateRange);
  const lastCursor = last(values.cursor);
  // requestParams is the object actually sent to the backend
  const requestParams = {
    cursor: lastCursor ? parseInt(lastCursor, 10) : undefined,
    search: values.search,
    page_size: values.pageSize,
    timestamp_gte: from,
    timestamp_lte: to,
    watchlist_hit: parseBool(values.watchlist_hit),
    has_outstanding_workflow_request: parseBool(
      values.has_outstanding_workflow_request,
    ),
    show_all: parseBool(values.show_unverified),
    ...getStatusAndManualReviewParams(values.state, values.verification),
  };
  const searchParams = getSearchParams({
    cursor: filters.query.cursor,
    dateRange: filters.query.date_range,
    pageSize: filters.query.page_size,
    search: filters.query.search,
    watchlist_hit: filters.query.watchlist_hit,
    state: filters.query.state,
    verification: filters.query.verification,
    has_outstanding_workflow_request:
      filters.query.has_outstanding_workflow_request,
    show_unverified: filters.query.show_unverified,
  });
  return {
    ...filters,
    searchParams,
    requestParams,
    values,
  };
};

export default useFilters;

const parseBool = (value: string | undefined) =>
  value ? value === 'true' : undefined;

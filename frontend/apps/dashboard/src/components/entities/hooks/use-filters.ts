import { EntityStatus } from '@onefootprint/types';
import last from 'lodash/last';
import { useMemo } from 'react';
import useBaseFilters, { getSearchParams, queryToArray, queryToBoolean, queryToString } from 'src/hooks/use-filters';
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
  labels?: string[];
  playbook_ids?: string[];
  external_id?: string;
};

export enum EntityStatusFilter {
  pass = 'pass',
  failed = 'fail',
  incomplete = 'incomplete',
  inProgress = 'in_progress',
  pending = 'pending',
  none = 'none',
  complete = 'complete',
  manualReview = 'manual_review',
}

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
  labels: undefined,
  playbook_ids: undefined,
  external_id: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<EntitiesQueryParams>(defaultQueryParams);

  const getStatusAndManualReviewParams = (state?: string, verification?: string) => {
    if (!state && !verification) {
      return {};
    }
    if (state === EntityStatus.incomplete) {
      return {
        statuses: queryToString([EntityStatus.incomplete, EntityStatus.pending]),
        requiresManualReview: false,
      };
    }
    if (!verification) {
      return {
        statuses: queryToString([EntityStatus.pass, EntityStatus.failed, EntityStatus.none]),
        requiresManualReview: false,
      };
    }
    if (verification === EntityStatusFilter.manualReview) {
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

  const values = useMemo(
    () => ({
      state: filters.query.state,
      verification: filters.query.verification,
      cursor: queryToArray(filters.query.cursor),
      dateRange: queryToArray(filters.query.date_range),
      labels: queryToArray(filters.query.labels),
      pageSize: filters.query.page_size ? parseInt(filters.query.page_size, 10) : 15,
      search: filters.query.search,
      watchlist_hit: queryToBoolean(filters.query.watchlist_hit),
      has_outstanding_workflow_request: queryToBoolean(filters.query.has_outstanding_workflow_request),
      show_unverified: queryToBoolean(filters.query.show_unverified),
      playbook_ids: filters.query.playbook_ids ? queryToArray(filters.query.playbook_ids) : undefined,
      external_id: filters.query.external_id,
    }),
    [filters.query],
  );

  const { from, to } = getDateRange(values.dateRange);
  const lastCursor = last(values.cursor);
  // requestParams is the object actually sent to the backend
  const requestParams = {
    cursor: lastCursor ? parseInt(lastCursor, 10) : undefined,
    search: values.search,
    labels: values.labels,
    page_size: values.pageSize,
    timestamp_gte: from,
    timestamp_lte: to,
    watchlist_hit: values.watchlist_hit,
    has_outstanding_workflow_request: values.has_outstanding_workflow_request,
    show_unverified: values.show_unverified,
    show_all: values.show_unverified,
    playbook_ids: values.playbook_ids,
    external_id: values.external_id,
    ...getStatusAndManualReviewParams(values.state, values.verification),
  };
  const searchParams = getSearchParams({
    cursor: filters.query.cursor,
    labels: values.labels,
    dateRange: filters.query.date_range,
    pageSize: filters.query.page_size,
    search: filters.query.search,
    watchlist_hit: filters.query.watchlist_hit,
    state: filters.query.state,
    verification: filters.query.verification,
    has_outstanding_workflow_request: filters.query.has_outstanding_workflow_request,
    show_unverified: filters.query.show_unverified,
    playbook_ids: filters.query.playbook_ids,
    externalId: values.external_id,
  });

  const filtersCount = useMemo(() => {
    let count = 0;
    if (values.watchlist_hit) {
      count += 1;
    }
    if (values.has_outstanding_workflow_request) {
      count += 1;
    }
    if (values.show_unverified) {
      count += 1;
    }
    if (values.labels.length) {
      count += values.labels.length;
    }
    if (values.dateRange.length) {
      const isDefault = values.dateRange.includes('all-time');
      if (!isDefault) {
        count += 1;
      }
    }
    if (values.playbook_ids?.length) {
      count += values.playbook_ids.length;
    }
    if (values.external_id) {
      count += 1;
    }
    return count;
  }, [values]);
  const hasFilters = filtersCount > 0;

  return {
    ...filters,
    hasFilters,
    filtersCount,
    searchParams,
    requestParams,
    values,
  };
};

export default useFilters;

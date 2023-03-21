import last from 'lodash/last';
import { DEFAULT_PAGE_SIZE } from 'src/config/constants';
import useFilters, { queryToArray, queryToString } from 'src/hooks/use-filters';
import getDateRange from 'src/utils/get-date-range';

export type UsersQueryParams = {
  status?: string | string[];
  date_range?: string | string[];
  search?: string;
  cursor?: string;
  pageSize?: string;
};

const defaultQueryParams: UsersQueryParams = {
  status: undefined,
  date_range: undefined,
  search: undefined,
  cursor: undefined,
  pageSize: undefined,
};

const useRiskSignalsFilters = () => {
  const filters = useFilters<UsersQueryParams>(defaultQueryParams);
  const values = {
    cursor: queryToArray(filters.query.cursor),
    dateRange: queryToArray(filters.query.date_range),
    pageSize: filters.query.pageSize || `${DEFAULT_PAGE_SIZE}`,
    search: filters.query.search,
    status: queryToArray(filters.query.status),
  };
  const { from, to } = getDateRange(values.dateRange);
  const requestParams = {
    cursor: last(values.cursor),
    search: values.search,
    pageSize: values.pageSize,
    statuses: queryToString(values.status),
    timestamp_gte: from,
    timestamp_lte: to,
  };
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useRiskSignalsFilters;

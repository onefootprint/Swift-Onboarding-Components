import last from 'lodash/last';
import { DEFAULT_PAGE_SIZE } from 'src/config/constants';
import useBaseFilters, {
  getSearchParams,
  queryToArray,
  queryToString,
} from 'src/hooks/use-filters';
import getDateRange from 'src/utils/get-date-range';

export type EntitiesQueryParams = {
  status?: string | string[];
  date_range?: string | string[];
  search?: string;
  cursor?: string;
  page_size?: string;
};

const defaultQueryParams: EntitiesQueryParams = {
  status: undefined,
  date_range: undefined,
  search: undefined,
  cursor: undefined,
  page_size: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<EntitiesQueryParams>(defaultQueryParams);
  const values = {
    cursor: queryToArray(filters.query.cursor),
    dateRange: queryToArray(filters.query.date_range),
    pageSize: filters.query.page_size || `${DEFAULT_PAGE_SIZE}`,
    search: filters.query.search,
    status: queryToArray(filters.query.status),
  };
  const { from, to } = getDateRange(values.dateRange);
  const requestParams = {
    cursor: last(values.cursor),
    search: values.search,
    page_size: values.pageSize,
    statuses: queryToString(values.status),
    timestamp_gte: from,
    timestamp_lte: to,
  };
  const searchParams = getSearchParams({
    cursor: filters.query.cursor,
    dateRange: filters.query.date_range,
    pageSize: filters.query.page_size,
    search: filters.query.search,
    status: filters.query.status,
  });
  return {
    ...filters,
    searchParams,
    requestParams,
    values,
  };
};

export default useFilters;

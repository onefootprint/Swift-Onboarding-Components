import last from 'lodash/last';
import { DEFAULT_PAGE_SIZE } from 'src/config/constants';
import useBaseFilters, {
  queryToArray,
  queryToString,
} from 'src/hooks/use-filters';
import getDateRange from 'src/utils/get-date-range';

export type BusinessesQueryParams = {
  businesses_status?: string | string[];
  businesses_date_range?: string | string[];
  businesses_search?: string;
  businesses_cursor?: string;
  businesses_page_size?: string;
};

const defaultQueryParams: BusinessesQueryParams = {
  businesses_status: undefined,
  businesses_date_range: undefined,
  businesses_search: undefined,
  businesses_cursor: undefined,
  businesses_page_size: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<BusinessesQueryParams>(defaultQueryParams);
  const values = {
    cursor: queryToArray(filters.query.businesses_cursor),
    dateRange: queryToArray(filters.query.businesses_date_range),
    pageSize: filters.query.businesses_page_size || `${DEFAULT_PAGE_SIZE}`,
    search: filters.query.businesses_search,
    status: queryToArray(filters.query.businesses_status),
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
  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;

import { IdDI } from '@onefootprint/types';
import { useMemo } from 'react';
import { queryToArray } from 'src/hooks/use-filters';

import {
  SecurityLogsFilterValues,
  SecurityLogsQueryString,
} from '../use-security-logs-filters.types';

const useFilterValues = (
  query: SecurityLogsQueryString,
): SecurityLogsFilterValues => {
  const filterValues = useMemo(() => {
    const search = query.search || '';
    const dateRange = queryToArray(query.date_range);
    let dataAttributes = queryToArray(query.data_attributes);

    if (dataAttributes.includes(IdDI.ssn9)) {
      dataAttributes = [...dataAttributes, IdDI.ssn4];
    }

    return {
      dataAttributes,
      search,
      dateRange,
    };
  }, [query.data_attributes, query.date_range, query.search]);
  return filterValues;
};

export default useFilterValues;

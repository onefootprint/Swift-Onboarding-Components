import { IdDI } from '@onefootprint/types';
import { useMemo } from 'react';
import { queryToArray } from 'src/hooks/use-filters';

import getFilterValueForDI from '../../../utils/get-filter-value-for-di';
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

    if (dataAttributes.includes('name')) {
      dataAttributes = [
        ...dataAttributes,
        getFilterValueForDI(IdDI.firstName),
        getFilterValueForDI(IdDI.lastName),
      ];
    }

    if (dataAttributes.includes(getFilterValueForDI(IdDI.ssn9))) {
      dataAttributes = [...dataAttributes, IdDI.ssn4];
    }

    dataAttributes = dataAttributes.map(attr => attr.replace('id.', ''));

    return {
      dataAttributes,
      search,
      dateRange,
    };
  }, [query.data_attributes, query.date_range, query.search]);
  return filterValues;
};

export default useFilterValues;

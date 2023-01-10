import { UserDataAttribute } from '@onefootprint/types';
import { useMemo } from 'react';

import {
  SecurityLogsFilterValues,
  SecurityLogsQueryString,
} from '../use-security-logs-filters.types';

const useFilterValues = (
  query: SecurityLogsQueryString,
): SecurityLogsFilterValues => {
  const filterValues = useMemo(() => {
    const search = query.search || '';

    let dataAttributes = query.data_attributes || [];
    if (typeof dataAttributes === 'string') {
      dataAttributes = [dataAttributes];
    }
    if (dataAttributes.includes('name')) {
      dataAttributes = [
        ...dataAttributes,
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
      ];
    }
    if (dataAttributes.includes(UserDataAttribute.ssn9)) {
      dataAttributes = [...dataAttributes, UserDataAttribute.ssn4];
    }

    let dateRange = query.date_range || [];
    if (typeof dateRange === 'string') {
      dateRange = [dateRange];
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

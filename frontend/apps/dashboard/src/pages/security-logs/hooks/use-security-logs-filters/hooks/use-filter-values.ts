import { IdDI } from '@onefootprint/types';
import { useMemo } from 'react';
import { queryToArray } from 'src/hooks/use-filters';

import type { SecurityLogsFilterValues, SecurityLogsQueryString } from '../use-security-logs-filters.types';

const useFilterValues = (query: SecurityLogsQueryString): SecurityLogsFilterValues => {
  const filterValues = useMemo(() => {
    const search = query.search || '';
    const dateRange = queryToArray(query.date_range);
    let dataAttributesPersonal = queryToArray(query.data_attributes_personal);
    const dataAttributesBusiness = queryToArray(query.data_attributes_business);

    if (dataAttributesPersonal.includes(IdDI.ssn9)) {
      dataAttributesPersonal = [...dataAttributesPersonal, IdDI.ssn4];
    }

    return {
      dataAttributesPersonal,
      dataAttributesBusiness,
      search,
      dateRange,
    };
  }, [query.data_attributes_business, query.data_attributes_personal, query.date_range, query.search]);
  return filterValues;
};

export default useFilterValues;

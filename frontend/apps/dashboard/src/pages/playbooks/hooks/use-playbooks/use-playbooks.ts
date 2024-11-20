import { getOrgPlaybooksOptions } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';

import useFilters from '../use-filters';

const usePlaybooks = () => {
  const filters = useFilters();
  const { requestParams } = filters;
  const query = useQuery({
    ...getOrgPlaybooksOptions({
      query: {
        kinds: requestParams.kinds,
        page: requestParams.page,
        search: requestParams.search,
        status: requestParams.status,
      },
    }),
    enabled: filters.isReady,
  });
  const { data, error } = query;

  const pagination = usePagination({
    count: data?.meta?.count,
    next: data?.meta?.nextPage,
    onChange: newPage => filters.push({ page: newPage.toString() }),
    page: filters.values.page,
    pageSize: 10,
  });
  const errorMessage = error ? getErrorMessage(error) : undefined;

  return {
    ...query,
    errorMessage,
    pagination,
  };
};

export default usePlaybooks;

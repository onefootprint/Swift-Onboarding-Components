import type { PaginatedRequestResponse } from '@onefootprint/request';
import request, { getErrorMessage } from '@onefootprint/request';
import type { GetPlaybooksRequest, GetPlaybooksResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useFilters from '../use-filters';

const getPlaybooks = async (authHeaders: AuthHeaders, params: GetPlaybooksRequest) => {
  const { data: response } = await request<PaginatedRequestResponse<GetPlaybooksResponse>>({
    method: 'GET',
    url: '/org/playbooks',
    headers: authHeaders,
    params,
  });

  return response;
};

const usePlaybooks = () => {
  const filters = useFilters();
  const { requestParams } = filters;
  const { authHeaders, isLive } = useSession();
  const onboardingConfigsQuery = useQuery({
    queryKey: ['playbooks', isLive, requestParams],
    queryFn: () => getPlaybooks(authHeaders, { ...requestParams }),
    enabled: filters.isReady,
  });
  const { data, error } = onboardingConfigsQuery;
  const pagination = usePagination({
    count: data?.meta?.count,
    next: data?.meta?.nextPage,
    onChange: newPage => filters.push({ page: newPage }),
    page: filters.values.page,
    pageSize: 10,
  });
  const errorMessage = error ? getErrorMessage(error) : undefined;

  return {
    ...onboardingConfigsQuery,
    errorMessage,
    pagination,
  };
};

export default usePlaybooks;

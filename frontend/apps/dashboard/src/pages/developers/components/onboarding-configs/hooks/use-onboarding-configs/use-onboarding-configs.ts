import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import {
  GetOnboardingConfigsRequest,
  GetOnboardingConfigsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import QUERY_KEY from '../../constants/query-key';
import useFilters from '../use-filters';

const getOnboardingConfigs = async (
  authHeaders: AuthHeaders,
  params: GetOnboardingConfigsRequest,
) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetOnboardingConfigsResponse>
  >({
    method: 'GET',
    url: '/org/onboarding_configs',
    headers: authHeaders,
    params,
  });

  return response;
};

const useOnboardingConfigs = () => {
  const filters = useFilters();
  const { requestParams } = filters;
  const { authHeaders, isLive } = useSession();
  const onboardingConfigsQuery = useQuery(
    [QUERY_KEY, isLive, requestParams],
    () => getOnboardingConfigs(authHeaders, { ...requestParams }),
    {
      enabled: filters.isReady,
    },
  );
  const { data, error } = onboardingConfigsQuery;
  const pagination = usePagination({
    count: data?.meta.count,
    next: data?.meta.nextPage,
    onChange: newPage => filters.push({ onboarding_configs_page: newPage }),
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

export default useOnboardingConfigs;

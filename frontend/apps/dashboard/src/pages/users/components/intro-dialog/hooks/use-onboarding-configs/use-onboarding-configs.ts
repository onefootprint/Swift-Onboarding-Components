import request, { PaginatedRequestResponse } from '@onefootprint/request';
import { GetOnboardingConfigsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import QUERY_KEY from '../../constants/query-key';

const getOnboardingConfigs = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetOnboardingConfigsResponse>
  >({
    method: 'GET',
    url: '/org/onboarding_configs',
    headers: authHeaders,
  });

  return response.data;
};

const useOnboardingConfigs = () => {
  const { authHeaders } = useSession();
  return useQuery([QUERY_KEY], () => getOnboardingConfigs(authHeaders));
};

export default useOnboardingConfigs;

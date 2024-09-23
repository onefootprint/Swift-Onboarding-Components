import type { PaginatedRequestResponse } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetOnboardingConfigsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getOnboardingConfigs = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<PaginatedRequestResponse<GetOnboardingConfigsResponse>>({
    method: 'GET',
    url: '/org/onboarding_configs',
    headers: authHeaders,
  });

  return response.data;
};

const useOnboardingConfigs = () => {
  const { authHeaders } = useSession();
  return useQuery({
    queryKey: ['entities', 'onboarding-configurations', authHeaders],
    queryFn: () => getOnboardingConfigs(authHeaders),
  });
};

export default useOnboardingConfigs;

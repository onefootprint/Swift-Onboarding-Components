import request, { getErrorMessage } from '@onefootprint/request';
import { GetOnboardingConfigResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import QUERY_KEY from '../../constants/query-key';

const getOnboardingConfig = async (authHeaders: AuthHeaders, id: string) => {
  const response = await request<GetOnboardingConfigResponse>({
    method: 'GET',
    url: `/org/onboarding_configs/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const useOnboardingConfig = (id: string = '') => {
  const { authHeaders, data: sessionData } = useSession();
  const isLive = sessionData?.org?.isLive;

  const onboardingConfigQuery = useQuery(
    [QUERY_KEY, id, isLive],
    () => getOnboardingConfig(authHeaders, id),
    {
      enabled: !!id,
    },
  );
  const { error, data } = onboardingConfigQuery;

  return {
    ...onboardingConfigQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    data,
  };
};

export default useOnboardingConfig;

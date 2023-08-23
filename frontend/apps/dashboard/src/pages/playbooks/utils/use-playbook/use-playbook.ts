import request, { getErrorMessage } from '@onefootprint/request';
import { GetOnboardingConfigResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import { QUERY_KEY } from '../use-playbooks';

const getPlaybook = async (authHeaders: AuthHeaders, id: string) => {
  const response = await request<GetOnboardingConfigResponse>({
    method: 'GET',
    url: `/org/onboarding_configs/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const usePlaybook = (id: string = '') => {
  const { authHeaders } = useSession();

  const onboardingConfigQuery = useQuery(
    [QUERY_KEY, id],
    () => getPlaybook(authHeaders, id),
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

export default usePlaybook;

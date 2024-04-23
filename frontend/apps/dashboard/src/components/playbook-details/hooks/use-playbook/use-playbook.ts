import request, { getErrorMessage } from '@onefootprint/request';
import type { GetOnboardingConfigResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import usePlaybookId from '../use-playbook-id';

const getPlaybook = async (authHeaders: AuthHeaders, id: string) => {
  const response = await request<GetOnboardingConfigResponse>({
    method: 'GET',
    url: `/org/onboarding_configs/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const usePlaybook = (overrideId?: string) => {
  const selectedId = usePlaybookId();
  const id = overrideId ?? selectedId;
  const { authHeaders } = useSession();

  const onboardingConfigQuery = useQuery(
    ['onboarding_configs', id],
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

import request from '@onefootprint/request';
import type { OrgOnboardingConfigCreateRequest, OrgOnboardingConfigCreateResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const createPlaybook = async (authHeaders: AuthHeaders, data: OrgOnboardingConfigCreateRequest) => {
  const response = await request<OrgOnboardingConfigCreateResponse>({
    data,
    headers: authHeaders,
    method: 'POST',
    url: '/org/onboarding_configs',
  });

  return response.data;
};

const useCreatePlaybook = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation((data: OrgOnboardingConfigCreateRequest) => createPlaybook(authHeaders, data), {
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });
};

export default useCreatePlaybook;

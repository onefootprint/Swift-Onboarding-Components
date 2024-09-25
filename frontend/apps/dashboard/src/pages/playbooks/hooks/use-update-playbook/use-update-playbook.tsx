import request from '@onefootprint/request';
import type { OrgOnboardingConfigUpdateRequest, OrgOnboardingConfigUpdateResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updatePlaybook = async (authHeaders: AuthHeaders, requestData: OrgOnboardingConfigUpdateRequest) => {
  const { id, ...data } = requestData;
  const response = await request<OrgOnboardingConfigUpdateResponse>({
    headers: authHeaders,
    method: 'PATCH',
    url: `/org/onboarding_configs/${id}`,
    data,
  });

  return response.data;
};

const useUpdatePlaybook = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrgOnboardingConfigUpdateRequest) => updatePlaybook(session.authHeaders, payload),

    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export default useUpdatePlaybook;

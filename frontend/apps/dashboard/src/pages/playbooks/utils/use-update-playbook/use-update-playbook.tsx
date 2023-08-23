import request from '@onefootprint/request';
import {
  OrgOnboardingConfigUpdateRequest,
  OrgOnboardingConfigUpdateResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const updatePlaybook = async (
  authHeaders: AuthHeaders,
  playbook: OrgOnboardingConfigUpdateRequest,
) => {
  const response = await request<OrgOnboardingConfigUpdateResponse>({
    headers: authHeaders,
    method: 'PATCH',
    url: `/org/onboarding_configs/${playbook.id}`,
    data: {
      status: playbook.status,
      name: playbook.name,
    },
  });

  return response.data;
};

const useUpdatePlaybook = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrgOnboardingConfigUpdateRequest) =>
      updatePlaybook(session.authHeaders, payload),

    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export default useUpdatePlaybook;

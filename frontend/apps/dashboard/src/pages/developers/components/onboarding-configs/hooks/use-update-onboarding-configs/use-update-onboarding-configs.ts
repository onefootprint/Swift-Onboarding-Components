import request from '@onefootprint/request';
import {
  OrgOnboardingConfigUpdateRequest,
  OrgOnboardingConfigUpdateResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const updateOnboardingConfig = async (
  authHeaders: AuthHeaders,
  onboardingConfig: OrgOnboardingConfigUpdateRequest,
) => {
  const response = await request<OrgOnboardingConfigUpdateResponse>({
    headers: authHeaders,
    method: 'PATCH',
    url: `/org/onboarding_configs/${onboardingConfig.id}`,
    data: {
      status: onboardingConfig.status,
      name: onboardingConfig.name,
    },
  });

  return response.data;
};

const useUpdateOnboardingConfigs = () => {
  const session = useSession();

  return useMutation({
    mutationFn: (payload: OrgOnboardingConfigUpdateRequest) =>
      updateOnboardingConfig(session.authHeaders, payload),
  });
};

export default useUpdateOnboardingConfigs;

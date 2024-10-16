import request from '@onefootprint/request';
import type { OrgOnboardingConfigCreateRequest, OrgOnboardingConfigCreateResponse } from '@onefootprint/types';
import type { AuthHeaders } from 'src/hooks/use-session';

const createPlaybook = async (authHeaders: AuthHeaders, data: OrgOnboardingConfigCreateRequest) => {
  const response = await request<OrgOnboardingConfigCreateResponse>({
    data,
    headers: authHeaders,
    method: 'POST',
    url: '/org/onboarding_configs',
  });

  return response.data;
};

export default createPlaybook;

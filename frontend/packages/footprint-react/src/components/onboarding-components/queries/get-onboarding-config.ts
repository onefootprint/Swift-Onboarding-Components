import type { GetPublicOnboardingConfigResponse } from '@onefootprint/types';

import request from '../utils/request';

const getOnboardingConfig = async (obConfig: string) => {
  const response = await request<GetPublicOnboardingConfigResponse>({
    method: 'GET',
    url: '/hosted/onboarding/config',
    headers: {
      'X-Onboarding-Config-Key': obConfig,
    },
  });

  return response;
};

export default getOnboardingConfig;

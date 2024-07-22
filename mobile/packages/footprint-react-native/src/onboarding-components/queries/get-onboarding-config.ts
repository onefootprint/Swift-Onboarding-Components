import type { GetPublicOnboardingConfigResponse } from '@onefootprint/types';
import request from 'src/utils/request';

const getOnboardingConfig = async (obConfig: string): Promise<GetPublicOnboardingConfigResponse> => {
  const response = await request<GetPublicOnboardingConfigResponse>({
    url: '/hosted/onboarding/config',
    method: 'GET',
    headers: {
      'X-Onboarding-Config-Key': obConfig,
    },
  });
  return response;
};

export default getOnboardingConfig;

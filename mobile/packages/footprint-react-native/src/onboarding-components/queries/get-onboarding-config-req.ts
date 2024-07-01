import type { GetPublicOnboardingConfigResponse } from '@onefootprint/types';
import { API_BASE_URL } from 'src/utils/constants';

const getOnboardingConfigReq = async (
  obConfig: string,
): Promise<GetPublicOnboardingConfigResponse> => {
  const response = await fetch(`${API_BASE_URL}/hosted/onboarding/config`, {
    method: 'GET',
    headers: {
      'X-Onboarding-Config-Key': obConfig,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch onboarding config');
  }
  const config = await response.json();
  return config as GetPublicOnboardingConfigResponse;
};

export default getOnboardingConfigReq;

import type { OnboardingStatusResponse } from '@onefootprint/types';

import { AUTH_HEADER } from '../constants';
import request from '../utils/request';

export type GetOnboardingStatusRequest = {
  authToken: string;
};

const getOnboardingStatus = async ({
  authToken,
}: GetOnboardingStatusRequest) => {
  const response = await request<OnboardingStatusResponse>({
    url: '/hosted/onboarding/status',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return {
    missingRequirements: response.allRequirements.filter(
      requirement => !requirement.isMet,
    ),
    onboardingConfig: response.obConfiguration,
  };
};

export default getOnboardingStatus;

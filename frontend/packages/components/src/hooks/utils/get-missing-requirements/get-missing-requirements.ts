import type {
  OnboardingStatusRequest,
  OnboardingStatusResponse,
} from '@onefootprint/types';

import { AUTH_HEADER } from '../../../constants';
import request from '../request';

const getOnboardingStatus = async ({ authToken }: OnboardingStatusRequest) => {
  const response = await request<OnboardingStatusResponse>({
    url: '/hosted/onboarding/status',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response;
};

const getMissingRequirements = async ({ authToken }: { authToken: string }) => {
  const response = await getOnboardingStatus({ authToken });
  return response.allRequirements.filter(requirement => !requirement.isMet);
};

export default getMissingRequirements;

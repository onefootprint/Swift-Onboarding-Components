import type {
  OnboardingStatusRequest,
  OnboardingStatusResponse,
} from '@onefootprint/types';

import { AUTH_HEADER } from '../../constants';
import request from '../../utils/request';

const getMissingRequirements = async ({
  authToken,
}: OnboardingStatusRequest) => {
  const response = await request<OnboardingStatusResponse>({
    url: '/hosted/onboarding/status',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.allRequirements.filter(requirement => !requirement.isMet);
};

export default getMissingRequirements;

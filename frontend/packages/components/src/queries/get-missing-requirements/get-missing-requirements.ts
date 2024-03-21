import type { OnboardingStatusResponse } from '@onefootprint/types';

import { AUTH_HEADER } from '../../constants';
import request from '../../utils/request';

export type GetMissingRequirementsRequest = {
  authToken: string;
};

const getMissingRequirements = async ({
  authToken,
}: GetMissingRequirementsRequest) => {
  const response = await request<OnboardingStatusResponse>({
    url: '/hosted/onboarding/status',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.allRequirements.filter(requirement => !requirement.isMet);
};

export default getMissingRequirements;

import type { OnboardingStatusResponse } from '@onefootprint/types';
import request from '../utils/request';

const getRequirements = async (options: { authToken: string }) => {
  const response = await request<OnboardingStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/status',
    headers: {
      'X-Fp-Authorization': options.authToken,
    },
  });

  const allRequirements = response.allRequirements;
  const missingRequirements = allRequirements.filter(requirement => !requirement.isMet);
  const isCompleted = missingRequirements.length === 0;

  return {
    all: allRequirements,
    missing: missingRequirements,
    isCompleted: isCompleted,
    isMissing: !isCompleted,
  };
};

export default getRequirements;

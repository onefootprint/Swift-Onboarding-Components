import type { OnboardingStatusResponse } from '@onefootprint/types';
import request from '../utils/request';

const getRequirements = async (options: { token: string }) => {
  const response = await request<OnboardingStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/status',
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  const all = response.allRequirements;
  const missing = all.filter(requirement => !requirement.isMet);
  return { all, missing, isCompleted: missing.length === 0 };
};

export default getRequirements;

import type {
  OnboardingRequest,
  OnboardingResponse,
} from '@onefootprint/types';

import { AUTH_HEADER } from '../constants';
import request from '../utils/request';

const startOnboarding = async (payload: OnboardingRequest) => {
  const response = await request<OnboardingResponse>({
    method: 'POST',
    url: '/hosted/onboarding',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response;
};

export default startOnboarding;

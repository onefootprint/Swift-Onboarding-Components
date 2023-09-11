import request from '@onefootprint/request';
import type { OnboardingRequest } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { AUTH_HEADER } from 'src/config/constants';

const onboardingRequest = async (payload: OnboardingRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useOnboarding = () => useMutation(onboardingRequest);

export default useOnboarding;

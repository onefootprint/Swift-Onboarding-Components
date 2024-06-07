import request from '@onefootprint/request';
import type { OnboardingRequest, OnboardingResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const onboardingRequest = async (payload: OnboardingRequest) => {
  const response = await request<OnboardingResponse>({
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

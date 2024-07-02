import request from '@onefootprint/request';
import type { OnboardingRequest, OnboardingResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const onboardingRequest = async (payload: OnboardingRequest) => {
  const { fixtureResult, authToken } = payload;
  const response = await request<OnboardingResponse>({
    method: 'POST',
    url: '/hosted/onboarding',
    headers: {
      [AUTH_HEADER]: authToken,
    },
    data: {
      fixtureResult,
    },
  });
  return response.data;
};

const useOnboarding = () => useMutation(onboardingRequest);

export default useOnboarding;

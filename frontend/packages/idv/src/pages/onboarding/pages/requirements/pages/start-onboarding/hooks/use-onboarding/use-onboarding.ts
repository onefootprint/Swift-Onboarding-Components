import request from '@onefootprint/request';
import type { OnboardingRequest, OnboardingResponse } from '@onefootprint/types';
import { AUTH_HEADER, CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const onboardingRequest = async (payload: OnboardingRequest) => {
  const { fixtureResult, authToken, playbookKey } = payload;
  const headers: Record<string, string> = {
    [AUTH_HEADER]: authToken,
  };
  if (playbookKey) {
    headers[CLIENT_PUBLIC_KEY_HEADER] = playbookKey;
  }
  const response = await request<OnboardingResponse>({
    method: 'POST',
    url: '/hosted/onboarding',
    headers,
    data: { fixtureResult },
  });
  return response.data;
};

const useOnboarding = () => {
  return useMutation({
    mutationFn: onboardingRequest,
  });
};

export default useOnboarding;

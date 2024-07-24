import request from '@onefootprint/request';
import type { OnboardingAuthorizeRequest } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const onboardingAuthorize = async (payload: OnboardingAuthorizeRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/authorize',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useOnboardingAuthorize = () => useMutation(onboardingAuthorize);

export default useOnboardingAuthorize;

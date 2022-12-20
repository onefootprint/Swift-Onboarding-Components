import request from '@onefootprint/request';
import { OnboardingRequest, OnboardingResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { AUTH_HEADER, CLIENT_PUBLIC_KEY_HEADER } from 'src/config/constants';

const onboardingRequest = async (payload: OnboardingRequest) => {
  const response = await request<OnboardingResponse>({
    method: 'POST',
    url: '/hosted/onboarding',
    headers: {
      [AUTH_HEADER]: payload.authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useOnboarding = () => useMutation(onboardingRequest);

export default useOnboarding;

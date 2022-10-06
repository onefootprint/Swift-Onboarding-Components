import request, { RequestError } from '@onefootprint/request';
import {
  OnboardingAuthorizeRequest,
  OnboardingAuthorizeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { AUTH_HEADER, CLIENT_PUBLIC_KEY_HEADER } from 'src/config/constants';

const onboardingAuthorize = async (payload: OnboardingAuthorizeRequest) => {
  const response = await request<OnboardingAuthorizeResponse>({
    method: 'POST',
    url: '/hosted/onboarding/authorize',
    headers: {
      [AUTH_HEADER]: payload.authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useOnboardingAuthorize = () =>
  useMutation<
    OnboardingAuthorizeResponse,
    RequestError,
    OnboardingAuthorizeRequest
  >(onboardingAuthorize);

export default useOnboardingAuthorize;

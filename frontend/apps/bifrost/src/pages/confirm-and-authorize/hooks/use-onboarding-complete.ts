import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import {
  BIFROST_AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from 'src/config/constants';

export type OnboardingCompleteRequest = {
  authToken: string;
  tenantPk: string;
};

export type OnboardingCompleteResponse = {
  validationToken: string; // A cryptographically generated auth token to authenticate a session
  missingWebauthnCredentials: boolean;
};

const onboardingCompleteRequest = async (
  payload: OnboardingCompleteRequest,
) => {
  const { data: response } = await request<
    RequestResponse<OnboardingCompleteResponse>
  >({
    method: 'POST',
    url: '/internal/onboarding/complete',
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useOnboardingComplete = () =>
  useMutation<
    OnboardingCompleteResponse,
    RequestError,
    OnboardingCompleteRequest
  >(onboardingCompleteRequest);

export default useOnboardingComplete;

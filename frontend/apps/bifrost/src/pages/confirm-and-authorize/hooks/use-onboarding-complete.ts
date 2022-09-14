import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import {
  BIFROST_AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from 'src/config/constants';
import { OnboardingCompleteRequest, OnboardingCompleteResponse } from 'types';

const onboardingCompleteRequest = async (
  payload: OnboardingCompleteRequest,
) => {
  const response = await request<OnboardingCompleteResponse>({
    method: 'POST',
    url: '/hosted/onboarding/complete',
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

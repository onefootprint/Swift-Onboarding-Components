import request, { RequestError } from '@onefootprint/request';
import {
  CollectedDataOptionLabels,
  OnboardingRequest,
  OnboardingResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import {
  BIFROST_AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from 'src/config/constants';

const onboardingRequest = async (payload: OnboardingRequest) => {
  const response = await request<OnboardingResponse>({
    method: 'POST',
    url: '/hosted/onboarding',
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  const { data } = response;
  return {
    ...data,
    missingAttributes: data.missingAttributes.map(
      (attr: string) => CollectedDataOptionLabels[attr],
    ),
  };
};

const useOnboarding = () =>
  useMutation<OnboardingResponse, RequestError, OnboardingRequest>(
    onboardingRequest,
  );

export default useOnboarding;

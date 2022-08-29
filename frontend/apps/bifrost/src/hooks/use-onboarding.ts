import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import {
  BIFROST_AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from 'src/config/constants';
import {
  CollectedDataOption,
  CollectedDataOptionLabels,
} from 'src/utils/state-machine/types';

export type OnboardingRequest = {
  authToken: string;
  tenantPk: string;
};

export type OnboardingResponse = {
  missingAttributes: CollectedDataOption[];
  missingWebauthnCredentials: boolean;
  // A cryptographically generated auth token to authenticate a session
  // Returned only if the user has already authorized the configuration for tenant
  validationToken?: string;
};

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

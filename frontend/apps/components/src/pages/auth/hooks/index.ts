import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type {
  GetOnboardingConfigRequest,
  GetPublicOnboardingConfigResponse,
  OnboardingValidateRequest,
  OnboardingValidateResponse,
} from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const getOnboardingConfig = async (payload: GetOnboardingConfigRequest) => {
  const { obConfigAuth, authToken } = payload;
  const response = await request<GetPublicOnboardingConfigResponse>({
    method: 'GET',
    url: '/hosted/onboarding/config',
    headers: obConfigAuth ?? {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

export const useGetOnboardingConfigDuplicated = (
  payload: GetOnboardingConfigRequest,
  options: {
    onSuccess?: (response: GetPublicOnboardingConfigResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const { obConfigAuth, authToken } = payload;

  return useQuery(
    ['get-onboarding-config', obConfigAuth, authToken],
    () => getOnboardingConfig(payload),
    {
      enabled: !!obConfigAuth || !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

const onboardingValidateRequest = async (
  payload: OnboardingValidateRequest,
): Promise<OnboardingValidateResponse> => {
  const response = await request<OnboardingValidateResponse>({
    method: 'POST',
    url: '/hosted/onboarding/validate',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response.data;
};

export const useOnboardingValidateDuplicated = () =>
  useMutation(onboardingValidateRequest);

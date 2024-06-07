import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetOnboardingConfigRequest, GetPublicOnboardingConfigResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

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

const useGetOnboardingConfig = (
  payload: GetOnboardingConfigRequest,
  options: {
    onSuccess?: (response: GetPublicOnboardingConfigResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const { obConfigAuth, authToken } = payload;

  return useQuery(['get-onboarding-config', obConfigAuth, authToken], () => getOnboardingConfig(payload), {
    enabled: !!obConfigAuth || !!authToken,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
};

export default useGetOnboardingConfig;

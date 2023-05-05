import request, { RequestError } from '@onefootprint/request';
import {
  GetOnboardingConfigRequest,
  GetOnboardingConfigResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

const getOnboardingConfig = async (payload: GetOnboardingConfigRequest) => {
  const { obConfigAuth } = payload;
  const response = await request<GetOnboardingConfigResponse>({
    method: 'GET',
    url: '/org/onboarding_config',
    headers: obConfigAuth,
  });

  return response.data;
};

const useGetOnboardingConfig = (
  payload: GetOnboardingConfigRequest,
  options: {
    onSuccess?: (response: GetOnboardingConfigResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const headers = Object.values(payload?.obConfigAuth || {}).filter(
    val => !!val,
  );

  return useQuery(
    ['get-onboarding-config', ...headers],
    () => getOnboardingConfig(payload),
    {
      enabled: headers.length > 0,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetOnboardingConfig;

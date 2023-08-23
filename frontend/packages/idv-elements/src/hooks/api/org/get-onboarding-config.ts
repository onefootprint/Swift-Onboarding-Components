import request, { RequestError } from '@onefootprint/request';
import {
  GetOnboardingConfigRequest,
  GetPublicOnboardingConfigResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../config/constants';

const getOnboardingConfig = async (payload: GetOnboardingConfigRequest) => {
  const { obConfigAuth, authToken } = payload;
  const response = await request<GetPublicOnboardingConfigResponse>({
    method: 'GET',
    url: '/org/onboarding_config',
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

export default useGetOnboardingConfig;

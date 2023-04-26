import request, { RequestError } from '@onefootprint/request';
import {
  GetOnboardingConfigRequest,
  GetOnboardingConfigResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import {
  KYB_BO_SESSION_AUTHORIZATION_HEADER,
  ONBOARDING_CONFIG_KEY_HEADER,
} from '../../../config/constants';

const getOnboardingConfig = async (payload: GetOnboardingConfigRequest) => {
  const response = await request<GetOnboardingConfigResponse>({
    method: 'GET',
    url: '/org/onboarding_config',
    headers: {
      [ONBOARDING_CONFIG_KEY_HEADER]: 'tenantPk' in payload && payload.tenantPk,
      [KYB_BO_SESSION_AUTHORIZATION_HEADER]:
        'kybBoAuthToken' in payload && payload.kybBoAuthToken,
    },
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
  const tenantPk = 'tenantPk' in payload && payload.tenantPk;
  const kybBoAuthToken = 'kybBoAuthToken' in payload && payload.kybBoAuthToken;

  return useQuery(
    ['get-onboarding-config', tenantPk, kybBoAuthToken],
    () => getOnboardingConfig(payload),
    {
      enabled: !!tenantPk || !!kybBoAuthToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetOnboardingConfig;

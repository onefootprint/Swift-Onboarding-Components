import request, { RequestError } from '@onefootprint/request';
import {
  GetOnboardingConfigRequest,
  GetOnboardingConfigResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { ONBOARDING_CONFIG_KEY_HEADER } from '../../../config/contants';

const getOnboardingConfig = async (payload: GetOnboardingConfigRequest) => {
  const response = await request<GetOnboardingConfigResponse>({
    method: 'GET',
    url: '/org/onboarding_config',
    headers: {
      [ONBOARDING_CONFIG_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useGetOnboardingConfig = (
  tenantPk: string,
  options: {
    onSuccess?: (response: GetOnboardingConfigResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  useQuery(
    ['get-onboarding-config', tenantPk],
    () => getOnboardingConfig({ tenantPk }),
    {
      enabled: !!tenantPk,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetOnboardingConfig;

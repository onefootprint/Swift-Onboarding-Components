import request, { RequestError } from '@onefootprint/request';
import {
  OnboardingStatusRequest,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import {
  AUTH_HEADER,
  ONBOARDING_CONFIG_KEY_HEADER,
} from '../../../config/constants';

const getOnboardingStatus = async (payload: OnboardingStatusRequest) => {
  const response = await request<OnboardingStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/status',
    headers: {
      [AUTH_HEADER]: payload.authToken,
      [ONBOARDING_CONFIG_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useGetOnboardingStatus = (
  authToken: string,
  tenantPk: string,
  options: {
    onSuccess?: (data: OnboardingStatusResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) =>
  useQuery<OnboardingStatusResponse, RequestError>(
    ['onboarding-status', authToken, tenantPk],
    () => getOnboardingStatus({ authToken, tenantPk }),
    {
      enabled: !!authToken && !!tenantPk,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );

export default useGetOnboardingStatus;

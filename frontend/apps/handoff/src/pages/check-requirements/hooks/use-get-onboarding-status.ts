import request, { RequestError } from '@onefootprint/request';
import {
  OnboardingStatusRequest,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useHandoffMachine } from 'src/components/machine-provider';

import {
  AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from '../../../config/constants';

const ONBOARDING_STATUS_FETCH_INTERVAL = 1000;

const getOnboardingStatus = async (payload: OnboardingStatusRequest) => {
  const response = await request<OnboardingStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/status',
    headers: {
      [AUTH_HEADER]: payload.authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useGetOnboardingStatus = (
  options: {
    onSuccess?: (data: OnboardingStatusResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const [state] = useHandoffMachine();
  const { authToken, tenant } = state.context;

  return useQuery<OnboardingStatusResponse, RequestError>(
    ['onboarding-status', authToken, tenant?.pk],
    () =>
      getOnboardingStatus({
        authToken: authToken ?? '',
        tenantPk: tenant?.pk ?? '',
      }),
    {
      refetchInterval: ONBOARDING_STATUS_FETCH_INTERVAL,
      enabled: !!authToken && !!tenant?.pk,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetOnboardingStatus;

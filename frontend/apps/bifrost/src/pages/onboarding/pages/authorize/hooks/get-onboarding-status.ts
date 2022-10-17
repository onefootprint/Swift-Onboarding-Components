import request, { RequestError } from '@onefootprint/request';
import {
  OnboardingStatusRequest,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { AUTH_HEADER, CLIENT_PUBLIC_KEY_HEADER } from 'src/config/constants';

import useOnboardingMachine from '../../../../../hooks/use-onboarding-machine';

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
  const [state] = useOnboardingMachine();
  const {
    authToken,
    tenant: { pk: tenantPk },
  } = state.context;

  return useQuery<OnboardingStatusResponse, RequestError>(
    ['onboarding-status', authToken, tenantPk],
    () => getOnboardingStatus({ authToken, tenantPk }),
    {
      enabled: !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetOnboardingStatus;

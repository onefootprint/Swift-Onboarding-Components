import request, { RequestError } from '@onefootprint/request';
import {
  OnboardingStatusRequest,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import {
  BIFROST_AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from 'src/config/constants';

import useOnboardingRequirementsMachine from '../../../hooks/use-onboarding-requirements-machine';

const ONBOARDING_STATUS_FETCH_INTERVAL = 1000;

const getOnboardingStatus = async (payload: OnboardingStatusRequest) => {
  const response = await request<OnboardingStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/status',
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
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
  const [state] = useOnboardingRequirementsMachine();
  const {
    authToken,
    tenant: { pk: tenantPk },
  } = state.context;

  return useQuery<OnboardingStatusResponse, RequestError>(
    ['onboarding-status', authToken],
    () => getOnboardingStatus({ authToken, tenantPk }),
    {
      refetchInterval: ONBOARDING_STATUS_FETCH_INTERVAL,
      enabled: !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetOnboardingStatus;

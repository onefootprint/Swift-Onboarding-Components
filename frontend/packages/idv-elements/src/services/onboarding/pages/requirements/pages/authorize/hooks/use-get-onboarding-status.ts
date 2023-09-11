import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type {
  OnboardingStatusRequest,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../../../config/constants';

const getOnboardingStatus = async (payload: OnboardingStatusRequest) => {
  const response = await request<OnboardingStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/status',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useGetOnboardingStatus = (
  authToken: string,
  options: {
    onSuccess?: (data: OnboardingStatusResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) =>
  useQuery<OnboardingStatusResponse, RequestError>(
    ['onboarding-status', authToken],
    () => getOnboardingStatus({ authToken }),
    {
      enabled: !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );

export default useGetOnboardingStatus;

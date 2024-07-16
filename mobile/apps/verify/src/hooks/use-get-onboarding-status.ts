import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { OnboardingStatusRequest, OnboardingStatusResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

type GetOnboardingStatusArgs = {
  enabled?: boolean;
  authToken: string;
  options?: {
    onSuccess?: (data: OnboardingStatusResponse) => void;
    onError?: (error: RequestError) => void;
  };
};

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

const useGetOnboardingStatus = ({ authToken, enabled = true, options = {} }: GetOnboardingStatusArgs) =>
  useQuery<OnboardingStatusResponse, RequestError>(
    ['onboarding-status', authToken],
    () => getOnboardingStatus({ authToken }),
    {
      enabled: !!authToken && !!enabled,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );

export default useGetOnboardingStatus;

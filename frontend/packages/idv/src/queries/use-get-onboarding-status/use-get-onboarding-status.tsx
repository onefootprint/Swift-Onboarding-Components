import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { OnboardingStatusRequest, OnboardingStatusResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

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

const useGetOnboardingStatus = ({ authToken, enabled = true, options = {} }: GetOnboardingStatusArgs) => {
  const query = useQuery({
    queryKey: ['onboarding-status', authToken],
    queryFn: () => getOnboardingStatus({ authToken }),
    enabled: !!authToken && !!enabled,
    gcTime: 0, // we should never cache this query
    staleTime: 0,
  });

  useEffect(() => {
    if (query.isSuccess && options.onSuccess) {
      options.onSuccess(query.data);
    }
    if (query.isError && options.onError) {
      options.onError(query.error as RequestError);
    }
    // no onSuccess or onError because likely to trigger infinite re-render/loop
  }, [query.isSuccess, query.isError, query.data, query.error]);

  return query;
};

export default useGetOnboardingStatus;

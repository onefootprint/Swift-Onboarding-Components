import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetOnboardingConfigRequest, GetPublicOnboardingConfigResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const getOnboardingConfig = async (payload: GetOnboardingConfigRequest) => {
  const { obConfigAuth, authToken } = payload;
  const response = await request<GetPublicOnboardingConfigResponse>({
    method: 'GET',
    url: '/hosted/onboarding/config',
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

  const query = useQuery({
    queryKey: ['get-onboarding-config', obConfigAuth, authToken],
    queryFn: () => getOnboardingConfig(payload),
    enabled: !!obConfigAuth || !!authToken,
    retry: 2,
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

export default useGetOnboardingConfig;

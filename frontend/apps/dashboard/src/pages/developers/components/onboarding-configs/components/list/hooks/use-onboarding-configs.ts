import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'hooks';
import take from 'lodash/take';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import type { OnboardingConfig } from 'src/types/onboarding-config';

export type GetOnboardingConfigsRequest = {
  authHeaders: AuthHeaders;
};

export type GetOnboardingConfigsResponse = OnboardingConfig[];

const getApiKeys = async ({ authHeaders }: GetOnboardingConfigsRequest) => {
  const { data: response } = await request<
    RequestResponse<GetOnboardingConfigsResponse>
  >({
    method: 'GET',
    url: '/org/onboarding_configs',
    headers: authHeaders,
  });
  return response.data;
};

const useOnboardingConfigs = () => {
  const { formatDateWithTime } = useIntl();
  const { authHeaders } = useSessionUser();
  return useQuery<GetOnboardingConfigsResponse, RequestError>(
    ['onboarding-configs', authHeaders],
    () => getApiKeys({ authHeaders }),
    {
      select: response =>
        // TODO: Remove take
        take(response, 10).map((onboardingKey: OnboardingConfig) => ({
          ...onboardingKey,
          createdAt: formatDateWithTime(new Date(onboardingKey.createdAt)),
        })),
    },
  );
};

export default useOnboardingConfigs;

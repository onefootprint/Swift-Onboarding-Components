import { useIntl } from '@onefootprint/hooks';
import request, {
  PaginatedRequestResponse,
  RequestError,
} from '@onefootprint/request';
import { OnboardingConfig } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

export type GetOnboardingConfigsRequest = {
  authHeaders: AuthHeaders;
};

export type GetOnboardingConfigsResponse = OnboardingConfig[];

const getOnboardingConfigs = async ({
  authHeaders,
}: GetOnboardingConfigsRequest) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetOnboardingConfigsResponse>
  >({
    method: 'GET',
    url: '/org/onboarding_configs',
    headers: authHeaders,
  });
  return response.data;
};

const useOnboardingConfigs = () => {
  const { formatDateWithTime } = useIntl();
  const { authHeaders } = useSession();
  return useQuery<GetOnboardingConfigsResponse, RequestError>(
    ['onboarding-configs', authHeaders],
    () => getOnboardingConfigs({ authHeaders }),
    {
      select: response =>
        response.map((onboardingKey: OnboardingConfig) => ({
          ...onboardingKey,
          createdAt: formatDateWithTime(new Date(onboardingKey.createdAt)),
        })),
    },
  );
};

export default useOnboardingConfigs;

import request from '@onefootprint/request';
import type { InProgressOnboarding } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { DASHBOARD_AUTHORIZATION_HEADER, DASHBOARD_IS_LIVE_HEADER } from 'src/config/constants';

type GetInProgressOnboardingProps = {
  authToken: string;
};

export const getInProgressOnboardings = async ({ authToken }: GetInProgressOnboardingProps) => {
  const response = await request<InProgressOnboarding>({
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: authToken,
      [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(true),
    },
    params: {
      isLive: true,
    },
    method: 'GET',
    url: '/org/member/in_progress_onboardings',
  });

  return response.data;
};

export const useGetInProgressOnboardings = (req: GetInProgressOnboardingProps) =>
  useQuery({
    queryKey: ['org-member', req],
    queryFn: () => getInProgressOnboardings(req),
    enabled: !!req.authToken,
  });

import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

export type GetOnboardingSessionResponse = {
  key?: string;
  bootstrapData: FootprintVerifyDataProps['bootstrapData'];
};

const getOnboardingSession = async (authToken: string) => {
  const { data: response } = await request<GetOnboardingSessionResponse>({
    method: 'GET',
    url: '/hosted/onboarding/session',
    headers: { 'x-fp-ob-token': authToken },
  });

  return response;
};

const useGetOnboardingSession = () => useMutation((authToken: string) => getOnboardingSession(authToken), { retry: 3 });

export default useGetOnboardingSession;

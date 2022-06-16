import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';

export type OnboardingCompleteRequest = {
  authToken: string;
};

export type OnboardingCompleteResponse = {
  footprintUserId: string;
  missingWebauthnCredentials: boolean;
};

const onboardingCompleteRequest = async (
  payload: OnboardingCompleteRequest,
) => {
  const { data: response } = await request<
    RequestResponse<OnboardingCompleteResponse>
  >({
    method: 'POST',
    url: '/onboarding/complete',
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useOnboardingComplete = () =>
  useMutation<
    OnboardingCompleteResponse,
    RequestError,
    OnboardingCompleteRequest
  >(onboardingCompleteRequest);

export default useOnboardingComplete;

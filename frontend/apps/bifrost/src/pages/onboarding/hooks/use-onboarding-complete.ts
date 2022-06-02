import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

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
    url: '/user/data',
    headers: {
      'X-Fpuser-Authorization': payload.authToken,
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

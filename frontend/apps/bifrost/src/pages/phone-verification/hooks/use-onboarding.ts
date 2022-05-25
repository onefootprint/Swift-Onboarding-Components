import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { UserDataAttribute } from 'src/bifrost-machine/types';

export type OnboardingRequest = {
  authToken: string;
};

export type OnboardingResponse = {
  missingAttributes: UserDataAttribute[];
  missingWebAuthnCredentials: boolean;
};

const onboardingRequest = async (payload: OnboardingRequest) => {
  const { data: response } = await request<RequestResponse<OnboardingResponse>>(
    {
      method: 'POST',
      url: '/onboarding',
      data: {},
      headers: {
        'X-Fpuser-Authorization': payload.authToken,
        'x-Client-Public-Key': 'pk_otkVUdD3vYxVH69ips3Ric', // TODO: Placeholder tenant ID for now
      },
    },
  );
  return response.data;
};

const useOnboarding = () =>
  useMutation<OnboardingResponse, RequestError, OnboardingRequest>(
    onboardingRequest,
  );

export default useOnboarding;

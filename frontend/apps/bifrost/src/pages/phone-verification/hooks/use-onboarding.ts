import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import {
  BIFROST_AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from 'src/config/constants';
import {
  UserDataAttribute,
  UserDataAttributeLabels,
} from 'src/utils/state-machine/types';

export type OnboardingRequest = {
  authToken: string;
  tenantPk: string;
};

export type OnboardingResponse = {
  missingAttributes: UserDataAttribute[];
  missingWebauthnCredentials: boolean;
};

const onboardingRequest = async (payload: OnboardingRequest) => {
  const { data: response } = await request<RequestResponse<OnboardingResponse>>(
    {
      method: 'POST',
      url: '/onboarding',
      headers: {
        [BIFROST_AUTH_HEADER]: payload.authToken,
        [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
      },
    },
  );
  return {
    ...response.data,
    missingAttributes: response.data.missingAttributes.map(
      (attr: string) => UserDataAttributeLabels[attr],
    ),
  };
};

const useOnboarding = () =>
  useMutation<OnboardingResponse, RequestError, OnboardingRequest>(
    onboardingRequest,
  );

export default useOnboarding;

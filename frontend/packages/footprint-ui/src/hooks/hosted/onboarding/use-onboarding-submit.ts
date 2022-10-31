import request from '@onefootprint/request';
import { StartKycRequest, StartKycResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import {
  AUTH_HEADER,
  ONBOARDING_CONFIG_KEY_HEADER,
} from '../../../config/constants';

const onboardingSubmit = async (payload: StartKycRequest) => {
  const response = await request<StartKycResponse>({
    method: 'POST',
    url: '/hosted/onboarding/submit',
    headers: {
      [AUTH_HEADER]: payload.authToken,
      [ONBOARDING_CONFIG_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useOnboardingSubmit = () => useMutation(onboardingSubmit);

export default useOnboardingSubmit;

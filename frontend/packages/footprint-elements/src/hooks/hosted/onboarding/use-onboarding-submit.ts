import request from '@onefootprint/request';
import {
  OnboardingSubmitRequest,
  OnboardingSubmitResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import {
  AUTH_HEADER,
  ONBOARDING_CONFIG_KEY_HEADER,
} from '../../../config/constants';

const onboardingSubmit = async (payload: OnboardingSubmitRequest) => {
  const response = await request<OnboardingSubmitResponse>({
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

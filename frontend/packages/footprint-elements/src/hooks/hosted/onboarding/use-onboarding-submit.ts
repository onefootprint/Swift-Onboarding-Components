import request from '@onefootprint/request';
import {
  OnboardingSubmitRequest,
  OnboardingSubmitResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../config/constants';

const onboardingSubmit = async (payload: OnboardingSubmitRequest) => {
  const response = await request<OnboardingSubmitResponse>({
    method: 'POST',
    url: '/hosted/onboarding/submit',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useOnboardingSubmit = () => useMutation(onboardingSubmit);

export default useOnboardingSubmit;

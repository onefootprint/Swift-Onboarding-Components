import request from '@onefootprint/request';
import type {
  OnboardingValidateRequest,
  OnboardingValidateResponse,
} from '@onefootprint/types/src/api/onboarding-validate';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const onboardingValidateRequest = async (
  payload: OnboardingValidateRequest,
) => {
  const response = await request<OnboardingValidateResponse>({
    method: 'POST',
    url: '/hosted/onboarding/validate',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response.data;
};

const useOnboardingValidate = () => useMutation(onboardingValidateRequest);

export default useOnboardingValidate;

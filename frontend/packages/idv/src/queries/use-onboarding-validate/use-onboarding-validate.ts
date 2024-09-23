import request from '@onefootprint/request';
import { AUTH_HEADER } from '@onefootprint/types';
import type {
  OnboardingValidateRequest,
  OnboardingValidateResponse,
} from '@onefootprint/types/src/api/onboarding-validate';
import { useMutation } from '@tanstack/react-query';

const onboardingValidateRequest = async (payload: OnboardingValidateRequest) => {
  const response = await request<OnboardingValidateResponse>({
    method: 'POST',
    url: '/hosted/onboarding/validate',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response.data;
};

const useOnboardingValidate = () => {
  return useMutation({
    mutationFn: onboardingValidateRequest,
  });
};

export default useOnboardingValidate;

import request from '@onefootprint/request';
import type { OnboardingValidateRequest, OnboardingValidateResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const onboardingValidateRequest = async (payload: OnboardingValidateRequest): Promise<OnboardingValidateResponse> => {
  const response = await request<OnboardingValidateResponse>({
    method: 'POST',
    url: '/hosted/onboarding/validate',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response.data;
};

const useOnboardingValidate = () => useMutation({ mutationFn: onboardingValidateRequest });

export default useOnboardingValidate;

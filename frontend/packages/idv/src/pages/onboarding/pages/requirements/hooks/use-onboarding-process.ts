import request from '@onefootprint/request';
import type { OnboardingProcessRequest } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const onboardingProcess = async (payload: OnboardingProcessRequest) => {
  const { authToken } = payload;
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/process',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useOnboardingProcess = () => {
  return useMutation({
    mutationFn: onboardingProcess,
  });
};

export default useOnboardingProcess;

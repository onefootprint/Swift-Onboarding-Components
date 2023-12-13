import request from '@onefootprint/request';
import type { OnboardingProcessRequest } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const onboardingProcess = async (payload: OnboardingProcessRequest) => {
  const { authToken, fixtureResult } = payload;
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/process',
    headers: {
      [AUTH_HEADER]: authToken,
    },
    data: {
      fixtureResult,
    },
  });
  return response.data;
};

const useOnboardingProcess = () => useMutation(onboardingProcess);

export default useOnboardingProcess;

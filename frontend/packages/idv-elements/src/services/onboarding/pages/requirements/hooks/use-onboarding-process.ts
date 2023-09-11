import request from '@onefootprint/request';
import type { OnboardingProcessRequest } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const onboardingProcess = async (payload: OnboardingProcessRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/process',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useOnboardingProcess = () => useMutation(onboardingProcess);

export default useOnboardingProcess;

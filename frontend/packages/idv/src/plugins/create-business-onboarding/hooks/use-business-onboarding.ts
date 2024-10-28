import request, { getErrorMessage } from '@onefootprint/request';
import type { BusinessOnboardingRequest, BusinessOnboardingResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { Logger } from '../../../utils/logger';

const businessOnboardingRequest = async ({ authToken, ...data }: BusinessOnboardingRequest) => {
  const headers: Record<string, string> = {
    [AUTH_HEADER]: authToken,
  };
  const response = await request<BusinessOnboardingResponse>({
    method: 'POST',
    url: '/hosted/business/onboarding',
    headers,
    data: {
      ...data,
      // TODO: remove this once we've started showing the business selector screen
      useLegacyInheritLogic: true,
    },
  });
  return response.data;
};

type FixedArgs = 'authToken' | 'kybFixtureResult';

const useBusinessOnboarding = (fixedArgs: Pick<BusinessOnboardingRequest, FixedArgs>) => {
  return useMutation({
    mutationFn: (args: Omit<BusinessOnboardingRequest, FixedArgs>) =>
      businessOnboardingRequest({ ...fixedArgs, ...args }),
    onError: (error: unknown) => {
      Logger.error(`Error while initiating onboarding. ${getErrorMessage(error)}`, {
        location: 'use-business-onboarding',
      });
    },
  });
};

export default useBusinessOnboarding;

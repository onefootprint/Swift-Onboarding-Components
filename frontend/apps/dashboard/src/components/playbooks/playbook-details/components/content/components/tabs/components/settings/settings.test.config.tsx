import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const withUpdatePlaybook = (onboardingConfig: Partial<OnboardingConfiguration>) => {
  return mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${onboardingConfig.id}`,
    response: {
      onboardingConfig,
    },
  });
};

export const withUpdatePlaybookError = (onboardingConfig: Partial<OnboardingConfiguration>) => {
  return mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${onboardingConfig.id}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};

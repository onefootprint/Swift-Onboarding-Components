import { mockRequest } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  OnboardingConfig,
  OnboardingConfigStatus,
} from '@onefootprint/types';

export const onboardingConfigDetailsFixture: OnboardingConfig = {
  id: 'ob_config_id_e0XeR8sxG2Fs6k7fQmYrEG',
  key: 'ob_live_cp5NX9wDbxkldd52hnJuRB',
  name: 'Lorem11',
  orgName: 'Acme Bank',
  logoUrl: null,
  privacyPolicyUrl: null,
  mustCollectData: [
    CollectedKycDataOption.email,
    CollectedKycDataOption.phoneNumber,
    CollectedKycDataOption.ssn4,
  ],
  canAccessData: [CollectedKycDataOption.ssn4],
  isLive: true,
  createdAt: '8/10/22, 11:56 AM',
  status: OnboardingConfigStatus.disabled,
  isAppClipEnabled: false,
  tenantId: 'org_Jr24ZzJj1RDg3DXv3V5HUIv',
};

export const withOnboardingConfigDetails = (
  id: string,
  response = onboardingConfigDetailsFixture,
) =>
  mockRequest({
    method: 'get',
    path: `/org/onboarding_configs/${id}`,
    response,
  });

export const withOnboardingConfigDetailsError = (id: string) =>
  mockRequest({
    method: 'get',
    path: `/org/onboarding_configs/${id}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withEditOnboardingConfig = (
  onboardingConfig: OnboardingConfig,
  newOnboardingConfig: Partial<OnboardingConfig>,
) =>
  mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${onboardingConfig.id}`,
    response: {
      ...onboardingConfig,
      ...newOnboardingConfig,
    },
  });

export const withEditOnboardingConfigError = (
  onboardingConfig: OnboardingConfig,
) =>
  mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${onboardingConfig.id}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

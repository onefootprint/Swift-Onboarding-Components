import { mockRequest } from '@onefootprint/test-utils';
import type { OnboardingConfig } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  OnboardingConfigStatus,
} from '@onefootprint/types';

export const playbookDetailsFixture: OnboardingConfig = {
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
  optionalData: [],
  isAppClipEnabled: false,
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isNoPhoneFlow: false,
  allowInternationalResidents: false,
  isDocFirstFlow: false,
  allowUsResidents: true,
  internationalCountryRestrictions: null,
  enhancedAml: {
    enhancedAml: false,
    ofac: false,
    pep: false,
    adverseMedia: false,
  },
};

export const withPlaybookDetails = (
  id: string,
  response = playbookDetailsFixture,
) =>
  mockRequest({
    method: 'get',
    path: `/org/onboarding_configs/${id}`,
    response,
  });

export const withPlaybookDetailsError = (id: string) =>
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

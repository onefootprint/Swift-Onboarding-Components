import { mockRequest } from '@onefootprint/test-utils';
import type { OnboardingConfig } from '@onefootprint/types';
import { CollectedKycDataOption, OnboardingConfigStatus } from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types/src/data/onboarding-config';

export const entityIdFixture: string = 'fp_id_wL6XIWe26cRinucZrRK1yn';

export const playbookDetailsFixture: OnboardingConfig = {
  author: {
    kind: 'organization',
    member: 'Jane doe',
  },
  allowInternationalResidents: false,
  allowUsResidents: true,
  allowUsTerritoryResidents: false,
  appearance: undefined,
  canAccessData: [],
  createdAt: '',
  enhancedAml: {
    enhancedAml: false,
    ofac: false,
    pep: false,
    adverseMedia: false,
  },
  id: 'ob_config_id_7TU1EGLHwjoioStPuRyWpm',
  internationalCountryRestrictions: null,
  isDocFirstFlow: false,
  isLive: false,
  isNoPhoneFlow: false,
  key: 'pb_live_cp5NX9wDbxkldd52hnJuRB',
  kind: OnboardingConfigKind.kyc,
  mustCollectData: [CollectedKycDataOption.name],
  name: 'Test playbook',
  optionalData: [],
  skipKyc: false,
  status: OnboardingConfigStatus.enabled,
  ruleSet: {
    version: 1,
  },
  documentsToCollect: null,
  promptForPasskey: true,
};

export const withPlaybookDetails = (id: string, response = playbookDetailsFixture) =>
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
      message: 'Something went wrong',
    },
  });

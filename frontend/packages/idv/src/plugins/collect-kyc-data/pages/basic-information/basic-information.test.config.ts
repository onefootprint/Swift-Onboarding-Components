import { mockRequest } from '@onefootprint/test-utils';
import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI, OnboardingConfigStatus, OnboardingRequirementKind } from '@onefootprint/types';

import type { KycData } from '../../utils/data-types';
import type { InitMachineArgs } from '../../utils/state-machine/machine';

export const getInitialContext = (data: KycData): InitMachineArgs => ({
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  config: {
    isLive: true,
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    orgId: 'orgId',
    status: OnboardingConfigStatus.enabled,
    isAppClipEnabled: false,
    isInstantAppEnabled: false,
    appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
    isNoPhoneFlow: false,
    requiresIdDoc: false,
    key: 'key',
    isKyb: false,
    allowInternationalResidents: false,
    supportedCountries: [],
  },
  requirement: {
    kind: OnboardingRequirementKind.collectKycData,
    isMet: false,
    missingAttributes: [CollectedKycDataOption.name, CollectedKycDataOption.dob],
    populatedAttributes: [],
    optionalAttributes: [],
  } as CollectKycDataRequirement,
  data: data ?? {},
  initialData: {},
});

export const withUserVault = () => {
  mockRequest({
    method: 'patch',
    path: '/hosted/user/vault',
    response: {
      data: {
        data: 'success',
      },
    },
  });
};

export const withUserVaultError = () => {
  mockRequest({
    method: 'patch',
    path: '/hosted/user/vault',
    statusCode: 400,
    response: {
      message: 'Vault data validation failed',
      code: 'T120',
      context: {
        [IdDI.firstName]: 'First name error',
        [IdDI.lastName]: 'Last name error',
        [IdDI.dob]: 'Date of birth error',
      },
    },
  });
};

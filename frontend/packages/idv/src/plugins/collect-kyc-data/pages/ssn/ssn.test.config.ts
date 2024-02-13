import { mockRequest } from '@onefootprint/test-utils';
import type { CollectKycDataRequirement } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  IdDI,
  OnboardingConfigStatus,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import type { KycData } from '../../utils/data-types';
import type { MachineContext } from '../../utils/state-machine';

export const getInitialContext = (
  data: KycData,
  ssnKind: 'ssn4' | 'ssn9',
): MachineContext => ({
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
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
    missingAttributes:
      ssnKind === 'ssn4'
        ? [CollectedKycDataOption.ssn4]
        : [CollectedKycDataOption.ssn9],
    populatedAttributes: [],
    optionalAttributes: [],
  } as CollectKycDataRequirement,
  data: data ?? {},
  initialData: {},
});

export const withUserVaultValidate = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/validate',
    response: {
      data: {
        data: 'success',
      },
    },
  });
};

export const withUserVaultValidateError = (kind: 'ssn4' | 'ssn9') => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/validate',
    statusCode: 400,
    response: {
      error: {
        message:
          kind === 'ssn4'
            ? {
                [IdDI.ssn4]: 'Invalid SSN',
              }
            : {
                [IdDI.ssn9]: 'Invalid SSN',
              },
      },
    },
  });
};

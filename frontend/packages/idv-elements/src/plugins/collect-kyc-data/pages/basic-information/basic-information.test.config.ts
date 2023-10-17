import { mockRequest } from '@onefootprint/test-utils';
import type { CollectKycDataRequirement } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  OnboardingConfigStatus,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import type { KycData } from '../../utils/data-types';
import type { MachineContext } from '../../utils/state-machine';

export const getInitialContext = (data: KycData): MachineContext => ({
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
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
  userFound: true,
  requirement: {
    kind: OnboardingRequirementKind.collectKycData,
    isMet: false,
    missingAttributes: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.dob,
    ],
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

export const withUserVaultValidateError = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/validate',
    statusCode: 400,
    response: {
      error: {
        message: {
          'id.first_name': 'First name error',
          'id.last_name': 'Last name error',
          'id.dob': 'Date of birth error',
        },
      },
    },
  });
};

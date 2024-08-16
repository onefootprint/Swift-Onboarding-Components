import { mockRequest } from '@onefootprint/test-utils';
import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI, OnboardingConfigStatus, OnboardingRequirementKind } from '@onefootprint/types';

import type { KycData } from '../../utils/data-types';
import type { InitMachineArgs } from '../../utils/state-machine/machine';

export const getInitialContext = (data: KycData, ssnKind: 'ssn4' | 'ssn9' | 'us_tax_id'): InitMachineArgs => {
  const getMissingAttributes = () => {
    if (ssnKind === 'ssn4') {
      return [CollectedKycDataOption.ssn4];
    }
    if (ssnKind === 'ssn9') {
      return [CollectedKycDataOption.ssn9];
    }
    return [CollectedKycDataOption.usTaxId];
  };

  return {
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
      missingAttributes: getMissingAttributes(),
      populatedAttributes: [],
      optionalAttributes: [],
    } as CollectKycDataRequirement,
    data: data ?? {},
    initialData: {},
  };
};

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

export const withUserVaultError = (kind: 'ssn4' | 'ssn9' | 'us_tax_id') => {
  const getContext = () => {
    if (kind === 'ssn4') {
      return {
        [IdDI.ssn4]: 'Invalid SSN',
      };
    }
    if (kind === 'ssn9') {
      return {
        [IdDI.ssn9]: 'Invalid SSN',
      };
    }
    return {
      [IdDI.usTaxId]: 'Invalid US Tax ID',
    };
  };

  mockRequest({
    method: 'patch',
    path: '/hosted/user/vault',
    statusCode: 400,
    response: {
      message: 'Vault data validation failed',
      code: 'T120',
      context: getContext(),
    },
  });
};

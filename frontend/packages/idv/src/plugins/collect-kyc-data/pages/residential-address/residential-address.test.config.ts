import { mockRequest } from '@onefootprint/test-utils';
import type { CollectKycDataRequirement, CountryCode } from '@onefootprint/types';
import { CollectedKycDataOption, OnboardingConfigStatus, OnboardingRequirementKind } from '@onefootprint/types';
import type { KycData } from 'src/plugins/collect-kyc-data/utils/data-types';

import type { InitMachineArgs } from '../../utils/state-machine/machine';

type GetInitialContextArgs = {
  data?: KycData;
  allowInternationalResidents?: boolean;
  supportedCountries?: CountryCode[];
};

const getInitialContext = ({
  data,
  allowInternationalResidents = false,
  supportedCountries = ['US'],
}: GetInitialContextArgs = {}): InitMachineArgs => ({
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
    allowInternationalResidents,
    supportedCountries,
  },
  requirement: {
    kind: OnboardingRequirementKind.collectKycData,
    isMet: false,
    missingAttributes: [CollectedKycDataOption.address],
    populatedAttributes: [],
    optionalAttributes: [],
  } as CollectKycDataRequirement,
  data: data ?? {},
  initialData: {},
});

export default getInitialContext;

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

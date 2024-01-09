import { mockRequest } from '@onefootprint/test-utils';
import type {
  CollectKycDataRequirement,
  CountryCode,
} from '@onefootprint/types';
import {
  CollectedKycDataOption,
  OnboardingConfigStatus,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import type { KycData } from 'src/plugins/collect-kyc-data/utils/data-types';
import type { MachineContext } from 'src/plugins/collect-kyc-data/utils/state-machine';

type GetInitialContextArgs = {
  data?: KycData;
  allowInternationalResidents?: boolean;
  supportedCountries?: CountryCode[];
};

const getInitialContext = ({
  data,
  allowInternationalResidents = false,
  supportedCountries = ['US'],
}: GetInitialContextArgs = {}): MachineContext => ({
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
    allowInternationalResidents,
    supportedCountries,
  },
  userFound: true,
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

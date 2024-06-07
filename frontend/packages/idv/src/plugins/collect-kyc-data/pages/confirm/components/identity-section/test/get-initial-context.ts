import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, OnboardingRequirementKind } from '@onefootprint/types';
import type { DeviceInfo } from 'src/hooks';
import type { KycData } from 'src/plugins/collect-kyc-data/utils/data-types';
import type { InitMachineArgs } from 'src/plugins/collect-kyc-data/utils/state-machine/machine';

import getOnboardingConfig from './get-onboarding-config';

type GetInitialContextArgs = {
  device?: DeviceInfo;
  requirement?: CollectKycDataRequirement;
  data?: KycData;
};

const getInitialContext = ({ device, requirement, data }: GetInitialContextArgs = {}): InitMachineArgs => ({
  authToken: 'token',
  device: device ?? {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  config: getOnboardingConfig(),
  requirement: requirement ?? {
    kind: OnboardingRequirementKind.collectKycData,
    isMet: false,
    missingAttributes: [],
    populatedAttributes: [CollectedKycDataOption.ssn4],
    optionalAttributes: [],
  },
  data: data ?? {},
  initialData: {},
});

export default getInitialContext;

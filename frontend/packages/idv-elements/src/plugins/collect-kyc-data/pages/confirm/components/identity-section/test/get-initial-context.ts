import {
  CollectedKycDataOption,
  CollectKycDataRequirement,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { DeviceInfo } from 'src/hooks';
import { KycData } from 'src/plugins/collect-kyc-data/utils';
import { MachineContext } from 'src/plugins/collect-kyc-data/utils/state-machine';

import getOnboardingConfig from './get-onboarding-config';

type GetInitialContextArgs = {
  device?: DeviceInfo;
  requirement?: CollectKycDataRequirement;
  data?: KycData;
};

const getInitialContext = ({
  device,
  requirement,
  data,
}: GetInitialContextArgs = {}): MachineContext => ({
  authToken: 'token',
  device: device ?? {
    type: 'mobile',
    hasSupportForWebauthn: true,
  },
  config: getOnboardingConfig(),
  userFound: true,
  requirement: requirement ?? {
    kind: OnboardingRequirementKind.collectKycData,
    missingAttributes: [],
    populatedAttributes: [CollectedKycDataOption.ssn4],
    optionalAttributes: [],
  },
  data: data ?? {},
  initialData: {},
});

export default getInitialContext;

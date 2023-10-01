import type { CollectKycDataRequirement } from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';
import type { DeviceInfo } from 'src/hooks';
import type { KycData } from 'src/plugins/collect-kyc-data/utils/data-types';
import type { MachineContext } from 'src/plugins/collect-kyc-data/utils/state-machine';

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
  requirement:
    requirement ??
    ({
      kind: OnboardingRequirementKind.collectKycData,
      isMet: false,
      missingAttributes: [],
      populatedAttributes: [],
      optionalAttributes: [],
    } as CollectKycDataRequirement),
  data: data ?? {},
  initialData: {},
});

export default getInitialContext;

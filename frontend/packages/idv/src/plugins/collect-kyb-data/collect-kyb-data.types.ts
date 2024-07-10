import type { CollectKybDataRequirement, CollectKycDataRequirement, PublicOnboardingConfig } from '@onefootprint/types';

import type { BusinessData, UserData } from '../../types';
import type { CommonIdvContext } from '../../utils/state-machine';

export type CollectKybDataContext = {
  bootstrapBusinessData: BusinessData;
  bootstrapUserData: UserData;
  config: PublicOnboardingConfig;
  kybRequirement: CollectKybDataRequirement;
  kycRequirement?: CollectKycDataRequirement;
};

export type CollectKybDataProps = {
  context: CollectKybDataContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};

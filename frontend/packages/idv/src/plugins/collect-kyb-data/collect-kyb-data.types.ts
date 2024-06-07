import type { CollectKybDataRequirement, CollectKycDataRequirement, PublicOnboardingConfig } from '@onefootprint/types';

import type { UserData } from '../../types';
import type { CommonIdvContext } from '../../utils/state-machine';

export type CollectKybDataContext = {
  config: PublicOnboardingConfig;
  kybRequirement: CollectKybDataRequirement;
  kycRequirement?: CollectKycDataRequirement;
  kycUserData: UserData;
};

export type CollectKybDataProps = {
  context: CollectKybDataContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};

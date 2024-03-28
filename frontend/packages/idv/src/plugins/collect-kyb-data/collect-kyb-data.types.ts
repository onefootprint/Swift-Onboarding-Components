import type {
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  KycBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { CommonIdvContext } from '../../utils/state-machine';

export type CollectKybDataContext = {
  config: PublicOnboardingConfig;
  kybRequirement: CollectKybDataRequirement;
  kycRequirement?: CollectKycDataRequirement;
  kycBootstrapData?: KycBootstrapData;
};

export type CollectKybDataProps = {
  context: CollectKybDataContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};

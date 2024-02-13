import type {
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  KycBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { BasePluginProps } from '../base-plugin';

export type CollectKybDataContext = {
  config: PublicOnboardingConfig;
  kybRequirement: CollectKybDataRequirement;
  kycRequirement?: CollectKycDataRequirement;
  kycBootstrapData?: KycBootstrapData;
};

export type CollectKybDataProps = BasePluginProps<CollectKybDataContext>;

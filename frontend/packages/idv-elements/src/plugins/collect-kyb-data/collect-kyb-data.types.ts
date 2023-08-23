import {
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  KycBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKybDataContext = {
  config: PublicOnboardingConfig;
  kybRequirement: CollectKybDataRequirement;
  kycRequirement?: CollectKycDataRequirement;
  kycBootstrapData?: KycBootstrapData;
  userFound: boolean;
};

export type CollectKybDataProps = BasePluginProps<CollectKybDataContext>;

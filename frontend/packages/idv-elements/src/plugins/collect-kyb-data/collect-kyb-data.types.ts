import {
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  KycBootstrapData,
  OnboardingConfig,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKybDataContext = {
  config: OnboardingConfig;
  kybRequirement: CollectKybDataRequirement;
  kycRequirement?: CollectKycDataRequirement;
  kycBootstrapData?: KycBootstrapData;
  userFound: boolean;
};

export type CollectKybDataProps = BasePluginProps<CollectKybDataContext>;

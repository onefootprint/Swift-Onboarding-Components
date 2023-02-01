import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKycDataContext = {
  missingAttributes: readonly CollectedKycDataOption[];
  userFound: boolean;
  email?: string;
  config: OnboardingConfig;
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

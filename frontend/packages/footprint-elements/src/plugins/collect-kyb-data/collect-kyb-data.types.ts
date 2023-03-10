import { CollectedKybDataOption, OnboardingConfig } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKybDataContext = {
  config: OnboardingConfig;
  missingAttributes: CollectedKybDataOption[];
};

export type CollectKybDataProps = BasePluginProps<CollectKybDataContext>;

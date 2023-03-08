import { BusinessDataAttribute, OnboardingConfig } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKybDataContext = {
  // TODO: fill in the context
  config: OnboardingConfig;
  missingAttributes: BusinessDataAttribute[];
};

export type CollectKybDataProps = BasePluginProps<CollectKybDataContext>;

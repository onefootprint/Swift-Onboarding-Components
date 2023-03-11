import {
  CollectedKybDataOption,
  CollectedKycDataOption,
  OnboardingConfig,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKybDataContext = {
  config: OnboardingConfig;
  missingKybAttributes: CollectedKybDataOption[];
  missingKycAttributes: CollectedKycDataOption[];
  userFound: boolean;
  email?: string;
};

export type CollectKybDataProps = BasePluginProps<CollectKybDataContext>;

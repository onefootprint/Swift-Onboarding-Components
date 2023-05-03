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
  // TODO: generalize this data by using DataIdentifiers
  email?: string;
  phoneNumber?: string;
};

export type CollectKybDataProps = BasePluginProps<CollectKybDataContext>;

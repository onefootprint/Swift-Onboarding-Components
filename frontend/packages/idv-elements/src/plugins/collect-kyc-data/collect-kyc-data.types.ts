import {
  CollectedKycDataOption,
  OnboardingConfig,
  UserData,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKycDataContext = {
  missingAttributes: CollectedKycDataOption[];
  fixedData?: UserData;
  userFound: boolean;
  email?: string;
  sandboxSuffix?: string; // only if in sandbox mode
  config: OnboardingConfig;
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

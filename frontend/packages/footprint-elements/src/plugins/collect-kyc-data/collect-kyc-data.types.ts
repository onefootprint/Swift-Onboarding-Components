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
  config: OnboardingConfig;
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

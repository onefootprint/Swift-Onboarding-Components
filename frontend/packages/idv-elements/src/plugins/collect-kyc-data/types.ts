import {
  CollectKycDataRequirement,
  IdDIData,
  OnboardingConfig,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKycDataContext = {
  requirement: CollectKycDataRequirement;
  fixedData?: IdDIData;
  email?: string; // TODO: remove
  userFound: boolean;
  sandboxSuffix?: string; // only if in sandbox mode
  config: OnboardingConfig;
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

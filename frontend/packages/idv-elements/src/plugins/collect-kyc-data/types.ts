import {
  CollectedKycDataOption,
  IdDI,
  OnboardingConfig,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type KycData = Partial<Record<IdDI, string>>;

export type CollectKycDataContext = {
  missingAttributes: CollectedKycDataOption[];
  fixedData?: KycData;
  email?: string; // TODO: remove
  userFound: boolean;
  sandboxSuffix?: string; // only if in sandbox mode
  config: OnboardingConfig;
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

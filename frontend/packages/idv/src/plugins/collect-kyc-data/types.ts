import type {
  CollectKycDataRequirement,
  IdDI,
  IdDIData,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { BasePluginProps } from '../base-plugin';

export type CollectKycDataContext = {
  config: PublicOnboardingConfig;
  requirement: CollectKycDataRequirement;
  bootstrapData?: IdDIData; // For tenant-provided initial data or email/phone from identify flows
  disabledFields?: IdDI[]; // To disable inputs, like when KYC'ing the first BO
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

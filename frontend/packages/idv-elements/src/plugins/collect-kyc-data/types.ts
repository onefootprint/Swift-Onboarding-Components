import {
  CollectKycDataRequirement,
  IdDI,
  IdDIData,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKycDataContext = {
  config: PublicOnboardingConfig;
  userFound: boolean;
  requirement: CollectKycDataRequirement;
  bootstrapData?: IdDIData; // For tenant-provided initial data or email/phone from identify flows
  disabledFields?: IdDI[]; // To disable inputs, like when KYC'ing the first BO
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

import {
  CollectKycDataRequirement,
  IdDI,
  IdDIData,
  OnboardingConfig,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKycDataContext = {
  config: OnboardingConfig;
  userFound: boolean;
  sandboxSuffix?: string; // only if in sandbox mode
  requirement: CollectKycDataRequirement;
  bootstrapData?: IdDIData; // For tenant-provided initial data or email/phone from identify flows
  fixedFields?: IdDI[]; // To disable inputs, like when KYC'ing the first BO
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

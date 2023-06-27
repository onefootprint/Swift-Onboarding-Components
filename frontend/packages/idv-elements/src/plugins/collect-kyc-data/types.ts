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
  requirement: CollectKycDataRequirement;
  bootstrapData?: IdDIData; // For tenant-provided initial data or email/phone from identify flows
  disabledFields?: IdDI[]; // To disable inputs, like when KYC'ing the first BO
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;

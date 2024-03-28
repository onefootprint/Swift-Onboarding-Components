import type {
  CollectKycDataRequirement,
  IdDI,
  IdDIData,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { CommonIdvContext } from '../../utils/state-machine';

export type VerifiedMethods = {
  isLoading: boolean;
  email?: string | false;
  phone?: string | false;
};

export type CollectKycDataContext = {
  config: PublicOnboardingConfig;
  requirement: CollectKycDataRequirement;
  bootstrapData?: IdDIData; // For tenant-provided initial data or email/phone from identify flows
  disabledFields?: IdDI[]; // To disable inputs, like when KYC'ing the first BO
};

export type CollectKycDataProps = {
  context: CollectKycDataContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};

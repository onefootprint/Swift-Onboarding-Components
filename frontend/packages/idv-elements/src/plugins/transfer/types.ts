import type {
  IdDocOutcome,
  IdDocRequirement,
  PublicOnboardingConfig,
  RegisterPasskeyRequirement,
} from '@onefootprint/types';

import type { BasePluginProps } from '../base-plugin';

export type TransferRequirements = {
  liveness?: RegisterPasskeyRequirement;
  idDoc?: IdDocRequirement;
};

export type TransferCustomData = {
  config: PublicOnboardingConfig;
  missingRequirements: TransferRequirements;
  idDocOutcome?: IdDocOutcome;
};

export type TransferProps = BasePluginProps<TransferCustomData>;

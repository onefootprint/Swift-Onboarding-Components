import type {
  IdDocOutcome,
  IdDocRequirement,
  PublicOnboardingConfig,
  RegisterPasskeyRequirement,
} from '@onefootprint/types';

import type { CommonIdvContext } from '../../utils/state-machine';

export type TransferRequirements = {
  liveness?: RegisterPasskeyRequirement;
  idDoc?: IdDocRequirement;
};

export type TransferContext = {
  config: PublicOnboardingConfig;
  missingRequirements: TransferRequirements;
  idDocOutcome?: IdDocOutcome;
};

export type TransferProps = {
  context: TransferContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};

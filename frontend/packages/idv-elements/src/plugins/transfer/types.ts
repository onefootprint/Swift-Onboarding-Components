import {
  IdDocOutcomes,
  IdDocRequirement,
  OnboardingConfig,
  RegisterPasskeyRequirement,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type TransferRequirements = {
  liveness?: RegisterPasskeyRequirement;
  idDoc?: IdDocRequirement;
};

export type TransferCustomData = {
  config: OnboardingConfig;
  missingRequirements: TransferRequirements;
  idDocOutcome?: IdDocOutcomes;
};

export type TransferProps = BasePluginProps<TransferCustomData>;

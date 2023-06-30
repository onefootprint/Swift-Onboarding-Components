import {
  IdDocRequirement,
  LivenessRequirement,
  OnboardingConfig,
} from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type TransferRequirements = {
  liveness?: LivenessRequirement;
  idDoc?: IdDocRequirement;
};

export type TransferCustomData = {
  config: OnboardingConfig;
  missingRequirements: TransferRequirements;
};

export type TransferProps = BasePluginProps<TransferCustomData>;

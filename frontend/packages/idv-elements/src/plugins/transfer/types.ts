import { IdDocRequirement, LivenessRequirement } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type TransferRequirements = {
  liveness?: LivenessRequirement;
  idDoc?: IdDocRequirement;
};

export type TransferCustomData = {
  missingRequirements: TransferRequirements;
};

export type TransferProps = BasePluginProps<TransferCustomData>;

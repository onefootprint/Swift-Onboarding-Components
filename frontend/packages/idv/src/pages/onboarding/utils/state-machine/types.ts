import type {
  IdDIData,
  IdDocOutcome,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { CommonIdvContext } from '../../../../utils/state-machine';

export type MachineContext = {
  config: PublicOnboardingConfig;
  idvContext: CommonIdvContext;
  bootstrapData: IdDIData; // TODO: generalize this more in the next iteration
  validationToken?: string;
  idDocOutcome?: IdDocOutcome;
  overallOutcome?: OverallOutcome;
  onClose?: () => void;
  onComplete?: (validationToken?: string, delay?: number) => void;
};

export type MachineEvents =
  | {
      type: 'requirementsCompleted';
    }
  | {
      type: 'validationComplete';
      payload: {
        validationToken: string;
      };
    };

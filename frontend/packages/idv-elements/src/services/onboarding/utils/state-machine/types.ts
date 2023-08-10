import { IdDIData, IdDocOutcomes, OnboardingConfig } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  authToken: string;
  bootstrapData: IdDIData; // TODO: generalize this more in the next iteration
  config?: OnboardingConfig;
  device?: DeviceInfo;
  userFound?: boolean;
  isTransfer?: boolean;
  validationToken?: string;
  idDocOutcome?: IdDocOutcomes;
  onClose?: () => void;
  onComplete?: (validationToken?: string, delay?: number) => void;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: OnboardingConfig;
        device?: DeviceInfo;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'requirementsCompleted';
    }
  | {
      type: 'validationComplete';
      payload: {
        validationToken: string;
      };
    };

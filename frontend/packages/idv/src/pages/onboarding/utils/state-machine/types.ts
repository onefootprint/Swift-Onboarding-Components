import type {
  IdDIData,
  IdDocOutcome,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  config: PublicOnboardingConfig;
  device: DeviceInfo;
  authToken: string;
  bootstrapData: IdDIData; // TODO: generalize this more in the next iteration
  isTransfer?: boolean;
  isComponentsSdk?: boolean;
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

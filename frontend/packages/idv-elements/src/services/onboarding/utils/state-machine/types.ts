import { DeviceInfo } from '@onefootprint/hooks';
import { IdDIData, ObConfigAuth, OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  obConfigAuth: ObConfigAuth;
  sandboxSuffix?: string; // only if in sandbox mode
  authToken: string;
  data: IdDIData; // TODO: generalize this more in the next iteration
  config?: OnboardingConfig;
  device?: DeviceInfo;
  userFound?: boolean;
  isTransfer?: boolean;
  validationToken?: string;
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
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

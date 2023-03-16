import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  userFound: boolean;
  config: OnboardingConfig;
  device: DeviceInfo;
  email?: string;
  sandboxSuffix?: string; // only if in sandbox mode
  authToken: string;
  validationToken?: string;
};

export type MachineEvents =
  | {
      type: 'onboardingInitialized';
      payload: {
        validationToken?: string;
      };
    }
  | {
      type: 'onboardingRequirementsCompleted';
    }
  | {
      type: 'authorized';
      payload: {
        validationToken: string;
      };
    };

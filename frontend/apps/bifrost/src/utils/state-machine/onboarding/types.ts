import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig, OnboardingStatus } from '@onefootprint/types';

export type MachineContext = {
  userFound: boolean;
  config: OnboardingConfig;
  device: DeviceInfo;
  email?: string;
  authToken: string;
  validationToken?: string;
  status?: OnboardingStatus;
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
        status: OnboardingStatus;
      };
    };

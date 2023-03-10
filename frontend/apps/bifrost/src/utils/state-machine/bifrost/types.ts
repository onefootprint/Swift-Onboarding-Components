import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig, OnboardingStatus } from '@onefootprint/types';

export type BootstrapData = {
  email?: string;
  phoneNumber?: string;
};

export type MachineContext = {
  authToken?: string;
  device?: DeviceInfo;
  config?: OnboardingConfig;
  userFound?: boolean;
  email?: string;
  validationToken?: string;
  bootstrapData?: BootstrapData;
  status?: OnboardingStatus;
  sandboxSuffix?: string;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: OnboardingConfig;
        device?: DeviceInfo;
        bootstrapData?: BootstrapData;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'sandboxOutcomeSubmitted';
      payload: {
        sandboxSuffix: string;
      };
    }
  | {
      type: 'identifyCompleted';
      payload: {
        authToken: string;
        userFound: boolean;
        email?: string;
      };
    }
  | {
      type: 'onboardingCompleted';
      payload: {
        validationToken?: string;
        status?: OnboardingStatus;
      };
    }
  | {
      type: 'reset';
    };

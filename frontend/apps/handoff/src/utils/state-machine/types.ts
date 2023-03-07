import { DeviceInfo } from '@onefootprint/hooks';
import { D2PStatus, OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  device?: DeviceInfo;
  opener?: string;
  authToken?: string;
  onboardingConfig?: OnboardingConfig;
  requirements?: Requirements;
};

export type Requirements = {
  missingIdDoc?: boolean;
  missingLiveness?: boolean;
  missingSelfie?: boolean;
  missingConsent?: boolean;
};

export type MachineEvents =
  | InitContextUpdatedEvent
  | {
      type: 'd2pAlreadyCompleted';
    }
  | {
      type: 'statusReceived';
      payload: {
        isError?: boolean;
        status?: D2PStatus;
      };
    }
  | {
      type: 'requirementsReceived';
      payload: {
        missingIdDoc?: boolean;
        missingSelfie?: boolean;
        missingLiveness?: boolean;
        missingConsent?: boolean;
      };
    }
  | {
      type: 'requirementCompleted';
    }
  | {
      type: 'reset';
    };

export type InitContextUpdatedEvent = {
  type: 'initContextUpdated';
  payload: {
    authToken?: string;
    opener?: string;
    device?: DeviceInfo;
    onboardingConfig?: OnboardingConfig;
    requirements?: Requirements;
  };
};

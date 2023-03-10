import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKycDataOption,
  OnboardingConfig,
  UserData,
} from '@onefootprint/types';

export type Requirements = {
  identityCheck: boolean;
  liveness: boolean;
  idDoc?: boolean;
  selfie?: boolean;
  consent?: boolean;
  kycData: readonly CollectedKycDataOption[];
};

export type MachineContext = {
  onboardingContext: {
    userFound: boolean;
    config: OnboardingConfig;
    device: DeviceInfo;
    authToken: string;
    email?: string;
  };
  startedDataCollection: boolean;
  requirements: Requirements;
  kycData: UserData; // Filled user data
};

export type MachineEvents =
  | {
      type: 'requirementCompleted';
    }
  | {
      type: 'onboardingRequirementsReceived';
      payload: Requirements;
    };

import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKybDataOption,
  CollectedKycDataOption,
  OnboardingConfig,
} from '@onefootprint/types';

export type Requirements = {
  identityCheck: boolean;
  liveness: boolean;
  idDoc?: boolean;
  selfie?: boolean;
  consent?: boolean;
  kycData: readonly CollectedKycDataOption[];
  kybData: CollectedKybDataOption[];
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
};

export type MachineEvents =
  | {
      type: 'requirementCompleted';
    }
  | {
      type: 'onboardingRequirementsReceived';
      payload: Requirements;
    };

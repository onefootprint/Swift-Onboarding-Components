import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  OnboardingConfig,
} from '@onefootprint/types';

export type Requirements = {
  liveness: boolean;
  idDoc?: boolean;
  selfie?: boolean;
  consent?: boolean;
  kycData: CollectedKycDataOption[];
  kybData: CollectedKybDataOption[];
  investorProfile: CollectedInvestorProfileDataOption[];
};

export type MachineContext = {
  onboardingContext: {
    userFound: boolean;
    config: OnboardingConfig;
    device: DeviceInfo;
    authToken: string;
    email?: string;
    sandboxSuffix?: string; // only if in sandbox mode
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

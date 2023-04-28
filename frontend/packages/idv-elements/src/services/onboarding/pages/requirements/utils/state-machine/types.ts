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
    isTransfer?: boolean;
  };
  startedDataCollection: boolean;
  collectedKycData?: boolean; // Used to determine if we should show a transition animation between kyc data and investor profile plugins
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

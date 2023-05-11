import { DeviceInfo } from '@onefootprint/hooks';
import {
  AuthorizeRequirement,
  CollectInvestorProfileRequirement,
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  IdDocRequirement,
  LivenessRequirement,
  OnboardingConfig,
} from '@onefootprint/types';

export type Requirements = {
  kyb?: CollectKybDataRequirement;
  kyc?: CollectKycDataRequirement;
  investorProfile?: CollectInvestorProfileRequirement;
  liveness?: LivenessRequirement;
  idDoc?: IdDocRequirement;
  authorize?: AuthorizeRequirement;
};

export type MachineContext = {
  onboardingContext: {
    userFound: boolean;
    config: OnboardingConfig;
    device: DeviceInfo;
    authToken: string;
    sandboxSuffix?: string; // only if in sandbox mode
    isTransfer?: boolean;
    // TODO: generalize this data using DataIdentifiers
    email?: string;
    phoneNumber?: string;
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

import { DeviceInfo } from '@onefootprint/hooks';
import {
  AuthorizeRequirement,
  CollectInvestorProfileRequirement,
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  IdDocRequirement,
  IdvBootstrapData,
  LivenessRequirement,
  OnboardingConfig,
} from '@onefootprint/types';

export type Requirements = {
  kyb?: CollectKybDataRequirement;
  kyc?: CollectKycDataRequirement;
  isKycMet?: boolean;
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
    bootstrapData?: IdvBootstrapData;
  };
  startedDataCollection: boolean;
  // TODO we might want a more generic list of requirements that have already been handled.
  // One day, when more plugins have confirm screens, we'll need this information to determine
  // whether to render the plugin for a requirement that's already been met
  collectedKycData?: boolean;
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

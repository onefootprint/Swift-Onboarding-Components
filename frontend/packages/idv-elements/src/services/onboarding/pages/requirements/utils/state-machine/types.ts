import {
  AuthorizeRequirement,
  CollectInvestorProfileRequirement,
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  IdDocOutcomes,
  IdDocRequirement,
  IdvBootstrapData,
  OnboardingConfig,
  ProcessRequirement,
  RegisterPasskeyRequirement,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../../../hooks/ui/use-device-info';

export type Requirements = {
  kyb?: CollectKybDataRequirement;
  kyc?: CollectKycDataRequirement;
  isKycMet?: boolean;
  investorProfile?: CollectInvestorProfileRequirement;
  liveness?: RegisterPasskeyRequirement;
  idDoc?: IdDocRequirement;
  authorize?: AuthorizeRequirement;
  process?: ProcessRequirement;
};

export type MachineContext = {
  onboardingContext: {
    userFound: boolean;
    config: OnboardingConfig;
    device: DeviceInfo;
    authToken: string;
    isTransfer?: boolean;
    bootstrapData?: IdvBootstrapData;
    idDocOutcome?: IdDocOutcomes;
  };
  /// The first time the router sends to a page, we'll mark `startedDataCollection` as true.
  /// There are a few pieces of logic that behave differently after we've started collecting data
  startedDataCollection: boolean;
  // TODO we might want a more generic list of requirement s that have already been handled.
  // One day, when more plugins have confirm screens, we'l l need this information to determine
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

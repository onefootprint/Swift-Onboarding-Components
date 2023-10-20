import type {
  IdDocOutcome,
  IdvBootstrapData,
  OnboardingRequirement,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../../../hooks/ui/use-device-info';

export type MachineContext = {
  onboardingContext: {
    userFound: boolean;
    config: PublicOnboardingConfig;
    device: DeviceInfo;
    authToken: string;
    isTransfer?: boolean;
    bootstrapData?: IdvBootstrapData;
    idDocOutcome?: IdDocOutcome;
    overallOutcome?: OverallOutcome;
  };
  /// The first time the router sends to a page, we'll mark `startedDataCollection` as true.
  /// There are a few pieces of logic that behave differently after we've started collecting data
  startedDataCollection: boolean;
  // TODO we might want a more generic list of requirement s that have already been handled.
  // One day, when more plugins have confirm screens, we'l l need this information to determine
  // whether to render the plugin for a requirement that's already been met
  collectedKycData?: boolean;
  // Record whether transfer plugin already ran. If the user chose to continue on desktop,
  // don't render transfer again
  didRunTransfer?: boolean;
  requirements: OnboardingRequirement[];
  // We have a feature flag to disable transfers on desktops for some customers
  isTransferOnDesktopDisabled?: boolean;
};

export type MachineEvents =
  | {
      type: 'requirementCompleted';
    }
  | {
      type: 'onboardingRequirementsReceived';
      payload: OnboardingRequirement[];
    };

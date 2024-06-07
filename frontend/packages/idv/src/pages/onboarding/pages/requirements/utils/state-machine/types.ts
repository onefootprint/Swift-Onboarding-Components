import type { IdDocOutcome, OnboardingRequirement, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';

import type { UserData } from '../../../../../../types';
import type { CommonIdvContext } from '../../../../../../utils/state-machine';

export type MachineContext = {
  idvContext: CommonIdvContext;
  onboardingContext: {
    config: PublicOnboardingConfig;
    userData: UserData;
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
  // The last requirement whose respective machine was handled
  lastHandledRequirement?: OnboardingRequirement;
  // We have a feature flag to disable transfers on desktops for some customers
  isTransferOnDesktopDisabled?: boolean;
};

export type MachineEvents =
  | {
      type: 'initialized';
    }
  | {
      type: 'error';
    }
  | {
      type: 'requirementCompleted';
    }
  | {
      type: 'onboardingRequirementsReceived';
      payload: OnboardingRequirement[];
    };

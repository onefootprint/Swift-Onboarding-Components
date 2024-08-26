import type { IdDocOutcome, OnboardingRequirement, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';

import type { BootstrapBusinessData, UserData } from '../../../../../../types';
import type { CommonIdvContext } from '../../../../../../utils/state-machine';

export type MachineContext = {
  idvContext: CommonIdvContext;
  onboardingContext: {
    config: PublicOnboardingConfig;
    bootstrapData: UserData & BootstrapBusinessData;
    idDocOutcome?: IdDocOutcome;
    overallOutcome?: OverallOutcome;
  };
  requirements: OnboardingRequirement[];

  /**
   * The first time the router sends to a page, we'll mark `isRequirementRouterVisited` as true.
   * There are a few pieces of logic that behave differently after we've started collecting data
   */
  isRequirementRouterVisited: boolean;

  /** To remember if KYB plugin was visited already */
  isKybDataCollected?: boolean;

  /** To remember if investor profile was visited already */
  isInvestorProfileCollected?: boolean;

  /**
   * TODO we might want a more generic list of requirement s that have already been handled.
   * One day, when more plugins have confirm screens, we'l l need this information to determine
   * whether to render the plugin for a requirement that's already been met
   */
  isKycDataCollected?: boolean;

  /** Record whether transfer plugin already ran. If the user chose to continue on desktop, don't render transfer again */
  isTransferVisited?: boolean;

  /** The last requirement whose respective machine was handled */
  lastHandledRequirement?: OnboardingRequirement;

  /** We have a feature flag to disable transfers on desktops for some customers */
  isTransferOnDesktopDisabled?: boolean;

  /** Record whether the user decided to proceed with capturing the docs on mobile (only applicable for the desktop flow) */
  continueOnMobile: boolean;
};

export type MachineEvents =
  | { type: 'error' }
  | { type: 'initialized' }
  | { type: 'onboardingRequirementsReceived'; payload: OnboardingRequirement[] }
  | { type: 'requirementCompleted' }
  | { type: 'continueOnMobile' }
  | { type: 'continueOnDesktop' };

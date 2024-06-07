import type { OnboardingStatusResponse } from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';

type MachineContext = {
  hasRunCollectedKycData: boolean;
  startedDataCollection: boolean;
  isTransfer: boolean;
  isComponentsSdk: boolean;
};

/// Given the list of requirements from the backend and some information about which requirements
/// we've already displayed, computes the frontend
const computeRequirementsToShow = (
  { hasRunCollectedKycData, startedDataCollection, isTransfer, isComponentsSdk }: MachineContext,
  response: OnboardingStatusResponse,
) => {
  const { allRequirements } = response;
  const unmetReqs = allRequirements.filter(r => !r.isMet);

  if (!startedDataCollection && !unmetReqs.length) {
    // If we haven't started data collection (== this is the first time we've checked requirements),
    // and if there are no unmet requirements, short circuit through all requirements.
    // This handles the case where someone tries to onboard onto the exact same onboarding config.
    return [];
  }

  // We want to show all unmet requirements, plus a few met requirements only once.
  // Note that we must preserve the order of the requirements as given to us by the backend
  const requirements = allRequirements.filter(r => {
    if (!r.isMet) {
      // Take all unmet requirements
      return true;
    }
    // There are special, requirement-kind-specific cases where we show a met requirement
    if (
      r.kind === OnboardingRequirementKind.collectKycData &&
      // Don't render the confirm screen if we've already run the collect KYC data machine
      !hasRunCollectedKycData &&
      // Don't show confirm if we're in the components SDK
      !isComponentsSdk &&
      // Don't show the confirm screen on the transfer app
      !isTransfer
    ) {
      // Show the CollectKycData plugin one time, even if it's met, to make sure we show the
      // confirm page
      return true;
    }
    return false;
  });

  return requirements;
};

export default computeRequirementsToShow;

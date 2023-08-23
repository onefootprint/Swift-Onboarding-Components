import {
  OnboardingRequirementKind,
  OnboardingStatusResponse,
} from '@onefootprint/types';

type AlreadyDisplayedRequirements = {
  collectedKycData: boolean;
};

/// Given the list of requirements from the backend and some information about which requirements
/// we've already displayed, computes the frontend
const computeRequirementsToShow = (
  isTransfer: boolean,
  startedDataCollection: boolean,
  { collectedKycData }: AlreadyDisplayedRequirements,
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
      !collectedKycData &&
      // TODO: Oooof need to make sure we show this if on transfer and we collected doc on transfer...
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

import {
  OnboardingRequirementKind,
  OnboardingStatusResponse,
} from '@onefootprint/types';

import { Requirements } from '../../../../utils/state-machine';

type AlreadyDisplayedRequirements = {
  collectedKycData: boolean;
};

/// Given the list of requirements from the backend and some information about which requirements
/// we've already displayed, computes the frontend,
const computeRequirementsToShow = (
  isTransfer: boolean,
  { collectedKycData }: AlreadyDisplayedRequirements,
  response: OnboardingStatusResponse,
) => {
  const { requirements, metRequirements } = response;
  const remainingRequirements = {} as Requirements;

  requirements.forEach(req => {
    if (req.kind === OnboardingRequirementKind.collectKybData) {
      remainingRequirements.kyb = req;
    } else if (req.kind === OnboardingRequirementKind.collectKycData) {
      remainingRequirements.kyc = req;
    } else if (req.kind === OnboardingRequirementKind.liveness) {
      remainingRequirements.liveness = req;
    } else if (req.kind === OnboardingRequirementKind.idDoc) {
      remainingRequirements.idDoc = req;
    } else if (req.kind === OnboardingRequirementKind.investorProfile) {
      remainingRequirements.investorProfile = req;
    } else if (req.kind === OnboardingRequirementKind.authorize) {
      remainingRequirements.authorize = req;
    }
  });

  metRequirements.forEach(req => {
    if (
      req.kind === OnboardingRequirementKind.collectKycData &&
      !collectedKycData &&
      !isTransfer
    ) {
      // Show the CollectKycData plugin one time, even if it's met, to make sure we show the
      // confirm page
      remainingRequirements.kyc = req;
      // This is ugly. Would be nice if this were part of the requirement itself, but need the
      // backend to return this
      remainingRequirements.isKycMet = true;
    }
  });

  return remainingRequirements;
};

export default computeRequirementsToShow;

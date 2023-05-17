import {
  CollectedKycDataOption,
  OnboardingConfig,
  OnboardingRequirement,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import computeRequirementsToShow from './compute-requirements-to-show';

describe('computeRequirementsToShow', () => {
  describe('when KYC requirement is met', () => {
    const requirementsResponse = {
      requirements: [],
      metRequirements: [
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [] as CollectedKycDataOption[],
          populatedAttributes: [CollectedKycDataOption.name],
        },
      ] as OnboardingRequirement[],
      // Not used
      obConfiguration: {} as OnboardingConfig,
    };
    it('should return KYC requirement when not yet shown', () => {
      const alreadyDisplayedRequirements = {
        collectedKycData: false,
      };
      const remainingRequirements = computeRequirementsToShow(
        false,
        alreadyDisplayedRequirements,
        requirementsResponse,
      );
      expect(remainingRequirements.kyc).toBeTruthy();
    });
    it('should not return KYC requirement when in transfer', () => {
      const alreadyDisplayedRequirements = {
        collectedKycData: false,
      };
      const remainingRequirements = computeRequirementsToShow(
        true,
        alreadyDisplayedRequirements,
        requirementsResponse,
      );
      expect(remainingRequirements.kyc).toBeFalsy();
    });
    it('should not return KYC requirement when already shown', () => {
      const alreadyDisplayedRequirements = {
        collectedKycData: true,
      };
      const remainingRequirements = computeRequirementsToShow(
        false,
        alreadyDisplayedRequirements,
        requirementsResponse,
      );
      expect(remainingRequirements.kyc).toBeFalsy();
    });
  });
});

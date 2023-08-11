import {
  CollectedKycDataOption,
  OnboardingConfig,
  OnboardingRequirement,
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import computeRequirementsToShow from './compute-requirements-to-show';

describe('computeRequirementsToShow', () => {
  describe('with met KYC requirement, unmet authorize', () => {
    const requirementsResponse = {
      requirements: [
        {
          kind: OnboardingRequirementKind.authorize,
          fieldsToAuthorize: {
            collectedData: [] as CollectedKycDataOption[],
            documentTypes: [] as SupportedIdDocTypes[],
          },
        },
      ] as OnboardingRequirement[],
      metRequirements: [
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [],
          optionalAttributes: [],
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
        true,
        alreadyDisplayedRequirements,
        requirementsResponse,
      );
      expect(remainingRequirements.kyc).toBeTruthy();
    });
    it('should return KYC requirement when not yet shown havent started collecting data', () => {
      const alreadyDisplayedRequirements = {
        collectedKycData: false,
      };
      const remainingRequirements = computeRequirementsToShow(
        false,
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
        false,
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
        false,
        alreadyDisplayedRequirements,
        requirementsResponse,
      );
      expect(remainingRequirements.kyc).toBeFalsy();
    });
  });
  describe('with met KYC requirement, no authorize', () => {
    const requirementsResponse = {
      requirements: [],
      metRequirements: [
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [],
          populatedAttributes: [CollectedKycDataOption.name],
          optionalAttributes: [],
        },
      ] as OnboardingRequirement[],
      // Not used
      obConfiguration: {} as OnboardingConfig,
    };
    it('should not return KYC requirement on initial fetch', () => {
      const alreadyDisplayedRequirements = {
        collectedKycData: false,
      };
      const remainingRequirements = computeRequirementsToShow(
        false,
        false,
        alreadyDisplayedRequirements,
        requirementsResponse,
      );
      expect(remainingRequirements.kyc).toBeFalsy();
    });
  });
});

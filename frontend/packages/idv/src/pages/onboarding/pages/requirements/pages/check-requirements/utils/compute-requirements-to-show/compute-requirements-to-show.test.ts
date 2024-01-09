import type {
  AuthorizeRequirement,
  CollectKycDataRequirement,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import {
  CollectedKycDataOption,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import computeRequirementsToShow from './compute-requirements-to-show';

const collectKycDataRequirement: CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData,
  isMet: true,
  missingAttributes: [],
  optionalAttributes: [],
  populatedAttributes: [CollectedKycDataOption.name],
};
const authorizeRequirement: AuthorizeRequirement = {
  kind: OnboardingRequirementKind.authorize,
  isMet: false,
  fieldsToAuthorize: {
    collectedData: [],
    documentTypes: [],
  },
};

describe('computeRequirementsToShow', () => {
  describe('with met KYC requirement, unmet authorize', () => {
    const requirementsResponse = {
      allRequirements: [
        {
          ...collectKycDataRequirement,
          isMet: true,
        },
        {
          ...authorizeRequirement,
          isMet: false,
        },
      ],
      // Not used
      obConfiguration: {} as PublicOnboardingConfig,
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
      expect(
        remainingRequirements.some(
          r => r.kind === OnboardingRequirementKind.collectKycData,
        ),
      ).toBeTruthy();
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
      expect(
        remainingRequirements.some(
          r => r.kind === OnboardingRequirementKind.collectKycData,
        ),
      ).toBeTruthy();
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
      expect(
        remainingRequirements.some(
          r => r.kind === OnboardingRequirementKind.collectKycData,
        ),
      ).toBeFalsy();
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
      expect(
        remainingRequirements.some(
          r => r.kind === OnboardingRequirementKind.collectKycData,
        ),
      ).toBeFalsy();
    });
  });
  describe('with met KYC requirement, no authorize', () => {
    const requirementsResponse = {
      allRequirements: [{ ...collectKycDataRequirement, isMet: true }],
      // Not used
      obConfiguration: {} as PublicOnboardingConfig,
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
      expect(
        remainingRequirements.some(
          r => r.kind === OnboardingRequirementKind.collectKycData,
        ),
      ).toBeFalsy();
    });
  });
});

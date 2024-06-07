import type { AuthorizeRequirement, CollectKycDataRequirement, PublicOnboardingConfig } from '@onefootprint/types';
import { CollectedKycDataOption, OnboardingRequirementKind } from '@onefootprint/types';

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
    it('should return met KYC requirement when not yet shown', () => {
      const context = {
        isTransfer: false,
        startedDataCollection: true,
        hasRunCollectedKycData: false,
        isComponentsSdk: false,
      };
      const remainingRequirements = computeRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeTruthy();
    });
    it('should return met KYC requirement when not yet shown and havent started collecting data', () => {
      const context = {
        isTransfer: false,
        startedDataCollection: false,
        hasRunCollectedKycData: false,
        isComponentsSdk: false,
      };
      const remainingRequirements = computeRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeTruthy();
    });
    it('should not return met KYC requirement when in transfer', () => {
      const context = {
        isTransfer: true,
        startedDataCollection: false,
        hasRunCollectedKycData: false,
        isComponentsSdk: false,
      };
      const remainingRequirements = computeRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeFalsy();
    });
    it('should not return met KYC requirement when already shown', () => {
      const context = {
        isTransfer: false,
        startedDataCollection: false,
        hasRunCollectedKycData: true,
        isComponentsSdk: false,
      };
      const remainingRequirements = computeRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeFalsy();
    });
    it('should not return met KYC requirement when in components sdk', () => {
      const context = {
        isTransfer: false,
        startedDataCollection: false,
        hasRunCollectedKycData: false,
        isComponentsSdk: true,
      };
      const remainingRequirements = computeRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeFalsy();
    });
  });
  describe('with met KYC requirement, no authorize', () => {
    const requirementsResponse = {
      allRequirements: [{ ...collectKycDataRequirement, isMet: true }],
      // Not used
      obConfiguration: {} as PublicOnboardingConfig,
    };
    it('should not return KYC requirement on initial fetch', () => {
      const context = {
        isTransfer: false,
        startedDataCollection: false,
        hasRunCollectedKycData: false,
        isComponentsSdk: false,
      };
      const remainingRequirements = computeRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeFalsy();
    });
  });
});

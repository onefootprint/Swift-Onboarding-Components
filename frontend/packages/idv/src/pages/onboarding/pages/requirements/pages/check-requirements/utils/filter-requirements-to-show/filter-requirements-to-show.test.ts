import type { AuthorizeRequirement, CollectKycDataRequirement, PublicOnboardingConfig } from '@onefootprint/types';
import { CollectedKycDataOption, OnboardingRequirementKind } from '@onefootprint/types';

import filterRequirementsToShow from './filter-requirements-to-show';

const collectKycDataRequirement: CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData,
  isMet: true,
  missingAttributes: [],
  optionalAttributes: [],
  populatedAttributes: [CollectedKycDataOption.name],
  recollectAttributes: [],
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
        { ...collectKycDataRequirement, isMet: true },
        { ...authorizeRequirement, isMet: false },
      ],
      // Not used
      obConfiguration: {} as PublicOnboardingConfig,
      canUpdateUserData: true,
    };
    it('should return met KYC requirement when not yet shown', () => {
      const context = {
        isComponentsSdk: false,
        isInvestorProfileCollected: false,
        isKybDataCollected: false,
        isKycDataCollected: false,
        isRequirementRouterVisited: true,
        isTransfer: false,
      };
      const remainingRequirements = filterRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeTruthy();
    });
    it('should return met KYC requirement when not yet shown and havent started collecting data', () => {
      const context = {
        isComponentsSdk: false,
        isInvestorProfileCollected: false,
        isKybDataCollected: false,
        isKycDataCollected: false,
        isRequirementRouterVisited: false,
        isTransfer: false,
      };
      const remainingRequirements = filterRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeTruthy();
    });
    it('should not return met KYC requirement when in transfer', () => {
      const context = {
        isComponentsSdk: false,
        isInvestorProfileCollected: false,
        isKybDataCollected: false,
        isKycDataCollected: false,
        isRequirementRouterVisited: false,
        isTransfer: true,
      };
      const remainingRequirements = filterRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeFalsy();
    });
    it('should not return met KYC requirement when already shown', () => {
      const context = {
        isComponentsSdk: false,
        isInvestorProfileCollected: false,
        isKybDataCollected: false,
        isKycDataCollected: true,
        isRequirementRouterVisited: false,
        isTransfer: false,
      };
      const remainingRequirements = filterRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeFalsy();
    });
    it('should not return met KYC requirement when in components sdk', () => {
      const context = {
        isComponentsSdk: true,
        isInvestorProfileCollected: false,
        isKybDataCollected: false,
        isKycDataCollected: false,
        isRequirementRouterVisited: false,
        isTransfer: false,
      };
      const remainingRequirements = filterRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeFalsy();
    });
  });
  describe('with met KYC requirement, no authorize', () => {
    const requirementsResponse = {
      allRequirements: [{ ...collectKycDataRequirement, isMet: true }],
      // Not used
      obConfiguration: {} as PublicOnboardingConfig,
      canUpdateUserData: true,
    };
    it('should not return KYC requirement on initial fetch', () => {
      const context = {
        isComponentsSdk: false,
        isInvestorProfileCollected: false,
        isKybDataCollected: false,
        isKycDataCollected: false,
        isRequirementRouterVisited: false,
        isTransfer: false,
      };
      const remainingRequirements = filterRequirementsToShow(context, requirementsResponse);
      expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.collectKycData)).toBeFalsy();
    });
  });

  it('should return investor profile when it is present and kyc data is already collected', () => {
    const context = {
      isComponentsSdk: false,
      isInvestorProfileCollected: false,
      isKycDataCollected: true,
      isRequirementRouterVisited: true,
      isTransfer: false,
    };
    const requirementsResponse = {
      allRequirements: [
        {
          isMet: true,
          kind: 'collect_data',
          missingAttributes: [],
          optionalAttributes: [],
          populatedAttributes: ['email', 'name', 'dob', 'full_address', 'phone_number'],
        },
        {
          isMet: true,
          kind: 'collect_investor_profile',
          missingAttributes: [],
          populatedAttributes: ['investor_profile'],
          missingDocument: false,
        },
        { isMet: false, kind: 'liveness' },
        {
          isMet: true,
          kind: 'authorize',
          fields_to_authorize: {
            collected_data: ['email', 'name', 'dob', 'full_address', 'phone_number', 'investor_profile'],
            document_types: [],
          },
          authorized_at: '2024-07-10T17:47:43.549216Z',
        },
        { is_met: false, kind: 'process' },
      ],
      obConfiguration: {} as PublicOnboardingConfig,
    };
    // @ts-expect-error: enum vs string
    const remainingRequirements = filterRequirementsToShow(context, requirementsResponse);
    expect(remainingRequirements.some(r => r.kind === OnboardingRequirementKind.investorProfile)).toBeTruthy();
  });
});

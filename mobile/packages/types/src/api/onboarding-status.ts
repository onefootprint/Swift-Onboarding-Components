import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '../data/collected-data-option';
import { SupportedIdDocTypes } from '../data/id-doc-type';

export enum OnboardingRequirementKind {
  liveness = 'liveness',
  idDoc = 'collect_document',
  collectKycData = 'collect_data',
  collectKybData = 'collect_business_data',
  investorProfile = 'collect_investor_profile',
  authorize = 'authorize',
}

export type CollectKybDataRequirement = {
  kind: OnboardingRequirementKind.collectKybData;
  missingAttributes: CollectedKybDataOption[];
};

export type CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData;
  missingAttributes: CollectedKycDataOption[];
  populatedAttributes: CollectedKycDataOption[];
};

export type CollectInvestorProfileRequirement = {
  kind: OnboardingRequirementKind.investorProfile;
  missingAttributes: CollectedInvestorProfileDataOption[];
};

export type IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc;
  shouldCollectSelfie: boolean;
  shouldCollectConsent: boolean;
  onlyUsSupported: boolean;
  supportedDocumentTypes: SupportedIdDocTypes[];
};

export type LivenessRequirement = {
  kind: OnboardingRequirementKind.liveness;
};

export type AuthorizeRequirement = {
  kind: OnboardingRequirementKind.authorize;
  fieldsToAuthorize: AuthorizeFields;
};

export type OnboardingRequirement =
  | CollectKybDataRequirement
  | CollectKycDataRequirement
  | CollectInvestorProfileRequirement
  | IdDocRequirement
  | LivenessRequirement
  | AuthorizeRequirement;

export type OnboardingStatusRequest = {
  authToken: string;
};

export type AuthorizeFields = {
  collectedData: CollectedKycDataOption[];
  identityDocumentTypes: SupportedIdDocTypes[];
};

export type OnboardingStatusResponse = {
  requirements: OnboardingRequirement[];
  metRequirements: OnboardingRequirement[];
};

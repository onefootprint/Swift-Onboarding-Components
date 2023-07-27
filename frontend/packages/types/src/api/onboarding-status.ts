import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '../data/collected-data-option';
import { SupportedIdDocTypes } from '../data/id-doc-type';
import { OnboardingConfig } from '../data/onboarding-config';

export enum OnboardingRequirementKind {
  liveness = 'liveness',
  idDoc = 'collect_document',
  collectKycData = 'collect_data',
  collectKybData = 'collect_business_data',
  investorProfile = 'collect_investor_profile',
  authorize = 'authorize',
  process = 'process',
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

export type ProcessRequirement = {
  kind: OnboardingRequirementKind.process;
};

export type OnboardingRequirement =
  | CollectKybDataRequirement
  | CollectKycDataRequirement
  | CollectInvestorProfileRequirement
  | IdDocRequirement
  | LivenessRequirement
  | AuthorizeRequirement
  | ProcessRequirement;

export type OnboardingStatusRequest = {
  authToken: string;
};

export type AuthorizeFields = {
  collectedData: CollectedKycDataOption[];
  documentTypes: SupportedIdDocTypes[];
};

export type OnboardingStatusResponse = {
  requirements: OnboardingRequirement[];
  metRequirements: OnboardingRequirement[];
  // This is only used to initialize handoff, and the requirements are discarded.
  obConfiguration: OnboardingConfig;
};

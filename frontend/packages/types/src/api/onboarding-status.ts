import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '../data/collected-data-option';
import IdDocType from '../data/id-doc-type';
import { OnboardingConfig } from '../data/onboarding-config';

export enum OnboardingRequirementKind {
  liveness = 'liveness',
  idDoc = 'collect_document',
  collectKycData = 'collect_data',
  collectKybData = 'collect_business_data',
  investorProfile = 'collect_investor_profile',
}

export type CollectKybDataRequirement = {
  kind: OnboardingRequirementKind.collectKybData;
  missingAttributes: CollectedKybDataOption[];
};

export type CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData;
  missingAttributes: CollectedKycDataOption[];
};

export type CollectInvestorProfileRequirement = {
  kind: OnboardingRequirementKind.investorProfile;
  missingAttributes: CollectedInvestorProfileDataOption[];
};

export type IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc;
  shouldCollectSelfie: boolean;
  shouldCollectConsent: boolean;
};

export type LivenessRequirement = {
  kind: OnboardingRequirementKind.liveness;
};

export type OnboardingRequirement =
  | CollectKybDataRequirement
  | CollectKycDataRequirement
  | CollectInvestorProfileRequirement
  | IdDocRequirement
  | LivenessRequirement;

export type OnboardingStatusRequest = {
  authToken: string;
};

export type AuthorizeFields = {
  collectedData: CollectedKycDataOption[];
  identityDocumentTypes: IdDocType[];
};

export type OnboardingStatusResponse = {
  obConfiguration: OnboardingConfig;
  requirements: OnboardingRequirement[];
  fieldsToAuthorize?: AuthorizeFields;
};

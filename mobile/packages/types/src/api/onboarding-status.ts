import { CountryCode } from '../data';
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
  isMet: boolean;
  missingAttributes: CollectedKybDataOption[];
};

export type CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData;
  isMet: boolean;
  missingAttributes: CollectedKycDataOption[];
  populatedAttributes: CollectedKycDataOption[];
};

export type CollectInvestorProfileRequirement = {
  kind: OnboardingRequirementKind.investorProfile;
  isMet: boolean;
  missingAttributes: CollectedInvestorProfileDataOption[];
};

export type IdDocSupportedCountryAndDocTypes = Record<
  CountryCode,
  SupportedIdDocTypes[]
>;

export type IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc;
  isMet: boolean;
  shouldCollectConsent: boolean;
  supportedCountryAndDocTypes: IdDocSupportedCountryAndDocTypes;
};

export type LivenessRequirement = {
  kind: OnboardingRequirementKind.liveness;
  isMet: boolean;
};

export type AuthorizeRequirement = {
  kind: OnboardingRequirementKind.authorize;
  isMet: boolean;
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
  allRequirements: OnboardingRequirement[];
};

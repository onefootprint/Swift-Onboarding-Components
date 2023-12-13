import type { PublicOnboardingConfig } from 'src/data';

import type {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '../data/collected-data-option';
import type { SupportedIdDocTypes } from '../data/id-doc-type';

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
  isMet: boolean;
  missingAttributes: CollectedKybDataOption[];
};

export type CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData;
  isMet: boolean;
  missingAttributes: CollectedKycDataOption[];
  populatedAttributes: CollectedKycDataOption[];
  optionalAttributes: CollectedKycDataOption[];
};

export type CollectInvestorProfileRequirement = {
  kind: OnboardingRequirementKind.investorProfile;
  isMet: boolean;
  missingAttributes: CollectedInvestorProfileDataOption[];
};

export type IdDocSupportedCountryAndDocTypes = Record<
  string,
  SupportedIdDocTypes[]
>;

export type IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc;
  isMet: boolean;
  shouldCollectConsent: boolean;
  shouldCollectSelfie: boolean;
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

export type ProcessRequirement = {
  kind: OnboardingRequirementKind.process;
  isMet: boolean;
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
  identityDocumentTypes: SupportedIdDocTypes[];
};

export type OnboardingStatusResponse = {
  allRequirements: OnboardingRequirement[];
  obConfiguration: PublicOnboardingConfig;
};

export type RequirementForKind<K> = K extends OnboardingRequirementKind.liveness
  ? LivenessRequirement
  : K extends OnboardingRequirementKind.idDoc
  ? IdDocRequirement
  : K extends OnboardingRequirementKind.collectKycData
  ? CollectKycDataRequirement
  : K extends OnboardingRequirementKind.collectKybData
  ? CollectKybDataRequirement
  : K extends OnboardingRequirementKind.investorProfile
  ? CollectInvestorProfileRequirement
  : K extends OnboardingRequirementKind.authorize
  ? AuthorizeRequirement
  : K extends OnboardingRequirementKind.process
  ? ProcessRequirement
  : never;

export const getRequirement = <K extends OnboardingRequirementKind>(
  reqs: OnboardingRequirement[],
  kind: K,
) => {
  const found = reqs.find(req => req.kind === kind);
  return found as RequirementForKind<K> | undefined;
};

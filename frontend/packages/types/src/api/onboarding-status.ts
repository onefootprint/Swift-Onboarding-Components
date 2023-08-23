import {
  CollectedDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '../data/collected-data-option';
import { SupportedIdDocTypes } from '../data/id-doc-type';
import { OnboardingConfig } from '../data/onboarding-config';

export enum OnboardingRequirementKind {
  registerPasskey = 'liveness', // TODO: eventually we need to synchronously rename `liveness` or create a duplicate
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

export type IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc;
  isMet: boolean;
  shouldCollectSelfie: boolean;
  shouldCollectConsent: boolean;
  onlyUsSupported: boolean;
  supportedDocumentTypes: SupportedIdDocTypes[];
};

export type RegisterPasskeyRequirement = {
  kind: OnboardingRequirementKind.registerPasskey;
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
  | RegisterPasskeyRequirement
  | AuthorizeRequirement
  | ProcessRequirement;

export type OnboardingStatusRequest = {
  authToken: string;
};

export type AuthorizeFields = {
  collectedData: CollectedDataOption[];
  documentTypes: SupportedIdDocTypes[];
};

export type OnboardingStatusResponse = {
  allRequirements: OnboardingRequirement[];
  // This is only used to initialize handoff, and the requirements are discarded.
  obConfiguration: OnboardingConfig;
};

export type RequirementForKind<K> =
  K extends OnboardingRequirementKind.registerPasskey
    ? RegisterPasskeyRequirement
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

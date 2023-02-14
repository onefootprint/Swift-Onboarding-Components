import { OnboardingConfig } from '../data';
import { CollectedKycDataOption } from '../data/collected-kyc-data-option';
import IdDocType from '../data/id-doc-type';

export enum OnboardingRequirementKind {
  liveness = 'liveness',
  idDoc = 'collect_document',
  collectKycData = 'collect_data',
  identityCheck = 'identity_check',
}

export type CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData;
  missingAttributes: CollectedKycDataOption[];
};

export type IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc;
  shouldCollectSelfie: boolean;
  shouldCollectConsent: boolean;
};

export type LivenessRequirement = {
  kind: OnboardingRequirementKind.liveness;
};

export type IdentityCheckRequirements = {
  kind: OnboardingRequirementKind.identityCheck;
};

export type OnboardingRequirement =
  | CollectKycDataRequirement
  | IdDocRequirement
  | LivenessRequirement
  | IdentityCheckRequirements;

export type OnboardingStatusRequest = {
  authToken: string;
};

export type AuthorizeFields = {
  collectedData: CollectedKycDataOption[];
  identityDocumentTypes: IdDocType[];
  selfieCollected: boolean;
};

export type OnboardingStatusResponse = {
  obConfiguration: OnboardingConfig;
  requirements: OnboardingRequirement[];
  fieldsToAuthorize?: AuthorizeFields;
};

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
  documentRequestId: string;
  shouldCollectSelfie: boolean;
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
  requirements: OnboardingRequirement[];
  fieldsToAuthorize?: AuthorizeFields;
};

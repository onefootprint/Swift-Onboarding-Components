import { CollectedKycDataOption } from '../data/collected-kyc-data-option';
import IdScanDocType from '../data/id-scan-doc-type';

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
  tenantPk: string;
};

export type AuthorizeFields = {
  collectedData: CollectedKycDataOption[];
  identityDocumentType: IdScanDocType[];
};

export type OnboardingStatusResponse = {
  requirements: OnboardingRequirement[];
  fieldsToAuthorize?: AuthorizeFields;
};

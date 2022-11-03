import { CollectedKycDataOption } from '../data/collected-kyc-data-option';
import IdScanDocType from '../data/id-scan-doc-type';

export enum OnboardingRequirementKind {
  liveness = 'liveness',
  collectDocument = 'collect_document',
  collectKycData = 'identity_check',
}

export type CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData;
  missingAttributes: CollectedKycDataOption[];
};

export type CollectDocumentRequirement = {
  kind: OnboardingRequirementKind.collectDocument;
};

export type LivenessRequirement = {
  kind: OnboardingRequirementKind.liveness;
};

export type OnboardingRequirement =
  | CollectKycDataRequirement
  | CollectDocumentRequirement
  | LivenessRequirement;

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

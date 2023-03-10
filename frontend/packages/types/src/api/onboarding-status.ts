import { OnboardingConfig } from '../data';
import {
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '../data/collected-data-option';
import IdDocType from '../data/id-doc-type';

export enum OnboardingRequirementKind {
  liveness = 'liveness',
  idDoc = 'collect_document',
  collectKycData = 'collect_data',
  collectKybData = 'collect_business_data',
  identityCheck = 'identity_check',
}

export type CollectKybDataRequirement = {
  kind: OnboardingRequirementKind.collectKybData;
  missingAttributes: CollectedKybDataOption[];
};

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
  | CollectKybDataRequirement
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

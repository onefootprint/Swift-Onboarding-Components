import { AuthMethodKind } from '../data/auth-method';
import type { CollectedDataOption } from '../data/collected-data-option';
import type { DocumentRequestConfig } from '../data/document-request-config';
import type { DocumentTypesAndCountries, OnboardingConfigKind } from '../data/onboarding-config';

type VerificationCheck = {
  kind: string;
  data: Record<string, unknown>;
};

export type OrgOnboardingConfigCreateRequest = {
  name: string;
  // document types, regionality and selfie are passed in a single string separated by ','
  // 'none' is passed if all three types are selected
  // eg: 'document.passport,id_card.regionality.selfie_required'.
  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
  optionalData: CollectedDataOption[];
  isDocFirstFlow?: boolean;
  isNoPhoneFlow?: boolean;
  allowInternationalResidents?: boolean;
  allowUsResidents?: boolean;
  allowUsTerritories?: boolean;
  internationalCountryRestrictions?: string[] | null;
  enhancedAml?: {
    enhancedAml: boolean;
    ofac: boolean;
    pep: boolean;
    adverseMedia: boolean;
  };
  cipKind?: string;
  documentsToCollect?: DocumentRequestConfig[];
  businessDocumentsToCollect?: DocumentRequestConfig[];
  documentTypesAndCountries: DocumentTypesAndCountries;
  kind: OnboardingConfigKind;
  skipConfirm?: boolean;
  skipKyc?: boolean;
  verificationChecks: VerificationCheck[] | null;
  requiredAuthMethods?: AuthMethodKind[];
};

export type OrgOnboardingConfigCreateResponse = string;

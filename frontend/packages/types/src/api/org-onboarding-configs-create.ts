import type { CollectedDataOption } from '../data/collected-data-option';
import type {
  DocumentTypesAndCountries,
  OnboardingConfigKind,
} from '../data/onboarding-config';

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
  docScanForOptionalSsn?: string;
  enhancedAml?: {
    enhancedAml: boolean;
    ofac: boolean;
    pep: boolean;
    adverseMedia: boolean;
  };
  kind: OnboardingConfigKind;
  skipKyc?: boolean;
  skipConfirm?: boolean;
  documentTypesAndCountries: DocumentTypesAndCountries;
  cipKind?: string;
  verificationChecks: VerificationCheck[] | null;
};

export type OrgOnboardingConfigCreateResponse = string;

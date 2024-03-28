import type { OnboardingConfigKind } from '../data';
import type { CollectedDataOption } from '../data/collected-data-option';
import type { DocumentTypesAndCountries } from '../data/onboarding-config';

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
};

export type OrgOnboardingConfigCreateResponse = string;

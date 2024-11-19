import type { AuthMethodKind } from './auth-method';
import type { CollectedDataOption } from './collected-data-option';
import type { CountryCode } from './countries';
import type { DocumentRequestConfig } from './document-request-config';
import type { FootprintAppearance } from './footprint-appearance';
import type { SupportedIdDocTypes } from './id-doc-type';

export enum OnboardingConfigStatus {
  enabled = 'enabled',
  disabled = 'disabled',
}

export enum OnboardingConfigKind {
  kyc = 'kyc',
  kyb = 'kyb',
  auth = 'auth',
  document = 'document',
}

export type DocumentTypesAndCountries = {
  countrySpecific?: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
  global?: SupportedIdDocTypes[];
};

export type KycCheck = {
  kind: 'kyc';
  data: {};
};

export type KybCheck = {
  kind: 'kyb';
  data: {
    einOnly: boolean;
  };
};

export type AmlCheck = {
  kind: 'aml';
  data: {
    ofac: boolean;
    pep: boolean;
    adverseMedia: boolean;
    continuousMonitoring: boolean;
    adverseMediaLists: Array<
      | 'financial_crime'
      | 'violent_crime'
      | 'sexual_crime'
      | 'cyber_crime'
      | 'terrorism'
      | 'fraud'
      | 'narcotics'
      | 'general_serious'
      | 'general_minor'
    >;
    matchKind: 'fuzzy_low' | 'fuzzy_medium' | 'fuzzy_high' | 'exact_name' | 'exact_name_and_dob_year';
  };
};

export type SentilinkCheck = {
  kind: 'sentilink';
  data: {};
};

export type NeuroCheck = {
  kind: 'neuro_id';
  data: {};
};

export type BusinessAmlCheck = {
  kind: 'business_aml';
  data: {};
};

export type VerificationCheck = KycCheck | KybCheck | AmlCheck | SentilinkCheck | NeuroCheck | BusinessAmlCheck;

// Used in the IDV context
export type PublicOnboardingConfig = {
  name: string;
  key: string;
  orgName: string;
  orgId: string;
  logoUrl: string | null;
  privacyPolicyUrl: string | null;
  isLive: boolean;
  status: OnboardingConfigStatus;
  appearance?: FootprintAppearance;
  isAppClipEnabled: boolean;
  isInstantAppEnabled: boolean;
  appClipExperienceId: string;
  isNoPhoneFlow: boolean;
  requiresIdDoc: boolean;
  isKyb: boolean;
  allowInternationalResidents: boolean;
  supportedCountries?: CountryCode[];
  allowedOrigins?: string[];
  canMakeRealDocScanCallsInSandbox?: boolean;
  isStepupEnabled?: boolean;
  kind?: 'auth' | 'kyb' | 'kyc';
  supportEmail?: string;
  supportPhone?: string;
  supportWebsite?: string;
  requiredAuthMethods?: AuthMethodKind[];
  nidEnabled?: boolean;
  skipConfirm?: boolean;
};

// Used in the dashboard context
export type OnboardingConfig = {
  id: string;
  name: string;
  key: string;
  isLive: boolean;
  createdAt: string;
  status: OnboardingConfigStatus;
  appearance?: FootprintAppearance;
  mustCollectData: CollectedDataOption[];
  optionalData: CollectedDataOption[];
  isNoPhoneFlow: boolean;
  allowUsResidents: boolean;
  allowInternationalResidents: boolean;
  internationalCountryRestrictions: null | CountryCode[];
  allowUsTerritoryResidents: boolean;
  supportedCountries?: CountryCode[];
  isDocFirstFlow: boolean;
  skipKyc?: boolean;
  kind: OnboardingConfigKind;
  author: {
    kind: string;
    member: string;
  };
  isRulesEnabled?: boolean;
  skipConfirm?: boolean;
  requiredAuthMethods: AuthMethodKind[] | null;
  documentTypesAndCountries?: DocumentTypesAndCountries;
  documentsToCollect: DocumentRequestConfig[] | null;
  businessDocumentsToCollect: DocumentRequestConfig[] | null;
  promptForPasskey: boolean;
  ruleSet: {
    version: number;
  };
  verificationChecks: VerificationCheck[];
};

import type { AuthMethodKind } from '../api';
import type { FootprintAppearance } from './appearance';
import type { CollectedDataOption } from './collected-data-option';
import type { CountryCode } from './countries';

export enum OnboardingConfigStatus {
  enabled = 'enabled',
  disabled = 'disabled',
}

export enum OnboardingConfigKind {
  kyc = 'kyc',
  kyb = 'kyb',
  auth = 'auth',
}

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
  canAccessData: CollectedDataOption[];
  optionalData: CollectedDataOption[];
  isNoPhoneFlow: boolean;
  allowUsResidents: boolean;
  allowInternationalResidents: boolean;
  internationalCountryRestrictions: null | CountryCode[];
  allowUsTerritoryResidents: boolean;
  supportedCountries?: CountryCode[];
  isDocFirstFlow: boolean;
  docScanForOptionalSsn?: string;
  enhancedAml: {
    enhancedAml: boolean;
    ofac: boolean;
    pep: boolean;
    adverseMedia: boolean;
  };
  skipKyc: boolean;
  kind: OnboardingConfigKind;
  author: {
    kind: string;
    member: string;
  };
};

import { FootprintAppearance } from '@onefootprint/footprint-js';

import { CollectedDataOption } from './collected-data-option';
import { CountryCode } from './countries';

export enum OnboardingConfigStatus {
  enabled = 'enabled',
  disabled = 'disabled',
}

// Used in the IDV context
export type PublicOnboardingConfig = {
  name: string;
  key: string;
  orgName: string;
  logoUrl: string | null;
  privacyPolicyUrl: string | null;
  isLive: boolean;
  status: OnboardingConfigStatus;

  appearance?: FootprintAppearance;

  isAppClipEnabled: boolean;
  isNoPhoneFlow: boolean;
  requiresIdDoc: boolean;
  isKyb: boolean;
  allowInternationalResidents: boolean;
  supportedCountries?: CountryCode[];
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

  orgName: string;
  logoUrl: string | null;
  privacyPolicyUrl: string | null;

  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
  optionalData: CollectedDataOption[];
  isAppClipEnabled: boolean;
  isNoPhoneFlow: boolean;
  allowInternationalResidents: boolean;
  supportedCountries?: CountryCode[];
  isDocFirstFlow: boolean;
};

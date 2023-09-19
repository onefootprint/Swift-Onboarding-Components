import type { FootprintAppearance } from '@onefootprint/footprint-js';

import type { CollectedDataOption } from './collected-data-option';
import type { CountryCode } from './countries';

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
  isInstantAppEnabled: boolean;
  appClipExperienceId: string;
  isNoPhoneFlow: boolean;
  requiresIdDoc: boolean;
  isKyb: boolean;
  allowInternationalResidents: boolean;
  supportedCountries?: CountryCode[];
  canMakeRealDocScanCallsInSandbox?: boolean;
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
  appClipExperienceId: string;
  isInstantAppEnabled: boolean;
  isNoPhoneFlow: boolean;
  allowUsResidents: boolean;
  allowInternationalResidents: boolean;
  supportedCountries?: CountryCode[];
  isDocFirstFlow: boolean;
};

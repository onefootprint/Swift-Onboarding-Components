import { FootprintAppearance } from '@onefootprint/footprint-js';

import { CollectedDataOption } from './collected-data-option';

export enum OnboardingConfigStatus {
  enabled = 'enabled',
  disabled = 'disabled',
}

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
};

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
  isDocFirstFlow: boolean;
};

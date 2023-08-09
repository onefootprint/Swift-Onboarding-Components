import { FootprintAppearance } from '@onefootprint/footprint-js';

import { CollectedDataOption } from './collected-data-option';

export type OnboardingConfig = {
  id: string;
  name: string;
  key: string;
  isLive: boolean;
  createdAt: string;
  status: 'enabled' | 'disabled';
  appearance?: FootprintAppearance;

  orgName: string;
  logoUrl: string | null;
  privacyPolicyUrl: string | null;

  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
  isAppClipEnabled: boolean;
};

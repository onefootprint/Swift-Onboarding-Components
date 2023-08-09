import { FootprintAppearance } from '@onefootprint/footprint-js';

import { CollectedDataOption } from './collected-data-option';

export type OnboardingConfig = {
  appearance?: FootprintAppearance;
  canAccessData: CollectedDataOption[];
  createdAt: string;
  id: string;
  isAppClipEnabled: boolean;
  isLive: boolean;
  key: string;
  logoUrl: string | null;
  mustCollectData: CollectedDataOption[];
  name: string;
  orgName: string;
  privacyPolicyUrl: string | null;
  status: 'enabled' | 'disabled';
  tenantId: string;
};

import { CollectedDataOption } from './collected-data-option';

export type OnboardingConfig = {
  id: string;
  name: string;
  key: string;
  isLive: boolean;
  createdAt: string;
  status: 'enabled' | 'disabled';

  orgName: string;
  logoUrl: string | null;
  privacyPolicyUrl: string | null;

  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
};

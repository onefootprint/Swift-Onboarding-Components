import { CollectedDataOption } from './collected-data-option';

export type OnboardingConfig = {
  canAccessData: CollectedDataOption[];
  createdAt: string;
  id: string;
  isLive: boolean;
  key: string;
  logoUrl: string | null;
  mustCollectData: CollectedDataOption[];
  mustCollectIdentityDocument: boolean;
  name: string;
  orgName: string;
  status: 'enabled' | 'disabled';
};

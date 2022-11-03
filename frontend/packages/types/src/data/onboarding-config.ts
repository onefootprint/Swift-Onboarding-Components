import { CollectedKycDataOption } from './collected-kyc-data-option';

export type OnboardingConfig = {
  canAccessData: CollectedKycDataOption[];
  createdAt: string;
  id: string;
  isLive: boolean;
  key: string;
  logoUrl: string | null;
  mustCollectData: CollectedKycDataOption[];
  mustCollectIdentityDocument: boolean;
  name: string;
  orgName: string;
  status: 'enabled' | 'disabled';
};

import { CollectedKycDataOption } from './collected-kyc-data-option';

export type OnboardingConfig = {
  createdAt: string;
  id: string;
  isLive: boolean;
  key: string;
  logoUrl: string | null;
  name: string;
  orgName: string;
  status: 'enabled' | 'disabled';
  mustCollectData: CollectedKycDataOption[];
  mustCollectIdentityDocument: boolean;
  mustCollectSelfie: boolean; // Frontend placeholder until the backend implementation
  canAccessData: CollectedKycDataOption[];
  canAccessIdentityDocumentImages: boolean;
  canAccessSelfieImage: boolean; // Frontend placeholder until the backend implementation
};

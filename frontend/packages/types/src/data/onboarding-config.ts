import { CollectedKycDataOption } from './collected-kyc-data-option';

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

  mustCollectData: CollectedKycDataOption[];
  mustCollectIdentityDocument: boolean;
  mustCollectSelfie: boolean; // Frontend placeholder until the backend implementation
  canAccessData: CollectedKycDataOption[];
  canAccessIdentityDocumentImages: boolean;
  canAccessSelfieImage: boolean; // Frontend placeholder until the backend implementation
};

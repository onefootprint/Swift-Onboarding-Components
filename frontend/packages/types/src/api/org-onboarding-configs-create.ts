import { CollectedKycDataOption } from '../data/collected-kyc-data-option';

export type OrgOnboardingConfigCreateRequest = {
  name: string;
  mustCollectData: CollectedKycDataOption[];
  mustCollectIdentityDocument?: boolean;
  mustCollectSelfie?: boolean;
  canAccessData: CollectedKycDataOption[];
  canAccessIdentityDocumentImages?: boolean;
  canAccessSelfieImage?: boolean;
};

export type OrgOnboardingConfigCreateResponse = string;

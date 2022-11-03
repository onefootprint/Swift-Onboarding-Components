import { CollectedKycDataOption } from '../data/collected-kyc-data-option';

export type OrgOnboardingConfigCreateRequest = {
  name: string;
  mustCollectData: CollectedKycDataOption[];
  mustCollectIdentityDocument?: boolean;
  canAccessData: CollectedKycDataOption[];
  canAccessIdentityDocumentImages?: boolean;
};

export type OrgOnboardingConfigCreateResponse = string;

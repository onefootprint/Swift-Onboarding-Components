import { CollectedDataOption } from '../data/collected-data-option';

export type OrgOnboardingConfigCreateRequest = {
  name: string;
  mustCollectData: CollectedDataOption[];
  mustCollectIdentityDocument?: boolean;
  canAccessData: CollectedDataOption[];
  canAccessIdentityDocumentImages?: boolean;
};

export type OrgOnboardingConfigCreateResponse = string;

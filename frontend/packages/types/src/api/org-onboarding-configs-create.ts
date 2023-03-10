import { CollectedDataOption } from '../data/collected-data-option';

export type OrgOnboardingConfigCreateRequest = {
  name: string;
  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
};

export type OrgOnboardingConfigCreateResponse = string;

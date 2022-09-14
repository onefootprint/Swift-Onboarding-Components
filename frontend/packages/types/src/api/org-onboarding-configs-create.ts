export type OrgOnboardingConfigCreateRequest = {
  name: string;
  mustCollectData: string[];
  canAccessData: string[];
};

export type OrgOnboardingConfigCreateResponse = string;

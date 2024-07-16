import type { ObConfigAuth, OnboardingConfig, PublicOnboardingConfig } from '../data';

export type GetOnboardingConfigRequest = {
  obConfigAuth?: ObConfigAuth;
  authToken?: string;
};

export type GetOnboardingConfigResponse = OnboardingConfig;
export type GetPublicOnboardingConfigResponse = PublicOnboardingConfig;

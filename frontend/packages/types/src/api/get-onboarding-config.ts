import { ObConfigAuth, OnboardingConfig } from '../data';

export type GetOnboardingConfigRequest = {
  obConfigAuth?: ObConfigAuth;
  authToken?: string;
};

export type GetOnboardingConfigResponse = OnboardingConfig;

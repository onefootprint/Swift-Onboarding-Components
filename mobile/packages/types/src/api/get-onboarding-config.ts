import type { ObConfigAuth, OnboardingConfig } from '../data';

export type GetOnboardingConfigRequest = {
  obConfigAuth?: ObConfigAuth;
};

export type GetOnboardingConfigResponse = OnboardingConfig;

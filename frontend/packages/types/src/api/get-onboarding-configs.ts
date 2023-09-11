import type { OnboardingConfig, OnboardingConfigStatus } from '../data';

export type GetOnboardingConfigsRequest = {
  status?: OnboardingConfigStatus;
  page?: number;
};

export type GetOnboardingConfigsResponse = OnboardingConfig[];

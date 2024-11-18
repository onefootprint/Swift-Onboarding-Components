import type { OnboardingConfig, OnboardingConfigStatus } from '../data';

export type GetPlaybooksRequest = {
  status?: OnboardingConfigStatus;
  page?: number;
};

export type GetPlaybooksResponse = OnboardingConfig[];

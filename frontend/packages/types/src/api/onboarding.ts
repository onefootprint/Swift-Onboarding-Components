import type { PublicOnboardingConfig } from '../data';

export type OnboardingRequest = {
  authToken: string;
};

export type OnboardingResponse = {
  onboardingConfig: PublicOnboardingConfig;
};

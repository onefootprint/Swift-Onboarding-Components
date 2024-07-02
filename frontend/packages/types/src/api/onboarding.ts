import type { OverallOutcome, PublicOnboardingConfig } from '../data';

export type OnboardingRequest = {
  authToken: string;
  fixtureResult?: OverallOutcome;
};

export type OnboardingResponse = {
  onboardingConfig: PublicOnboardingConfig;
};

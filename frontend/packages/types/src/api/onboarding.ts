import type { OverallOutcome, PublicOnboardingConfig } from '../data';

export type OnboardingRequest = {
  authToken: string;
  fixtureResult?: OverallOutcome;
  playbookKey?: string;
};

export type OnboardingResponse = {
  onboardingConfig: PublicOnboardingConfig;
};

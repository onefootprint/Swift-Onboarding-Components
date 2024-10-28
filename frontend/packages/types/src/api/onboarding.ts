import type { OverallOutcome, PublicOnboardingConfig } from '../data';

export type OnboardingRequest = {
  authToken: string;
  fixtureResult?: OverallOutcome;
  playbookKey?: string;
};

export type OnboardingResponse = {
  onboardingConfig: PublicOnboardingConfig;
  // TODO: not in use yet, but should migrate to inherit this new authToken.
  authToken: string;
};

export type BusinessOnboardingRequest = {
  authToken: string;
  kybFixtureResult?: OverallOutcome;
  inheritBusinessId?: string;
};

export type BusinessOnboardingResponse = {
  // TODO: not in use yet, but should migrate to inherit this new authToken.
  authToken: string;
};

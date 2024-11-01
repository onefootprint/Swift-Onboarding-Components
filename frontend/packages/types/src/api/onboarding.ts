import type { OverallOutcome } from '../data';

export type OnboardingRequest = {
  authToken: string;
  fixtureResult?: OverallOutcome;
  playbookKey?: string;
};

export type OnboardingResponse = {
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

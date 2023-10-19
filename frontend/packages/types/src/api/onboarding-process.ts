import type { OverallOutcome } from '../data';

export type OnboardingProcessRequest = {
  authToken: string;
  fixtureResult?: OverallOutcome;
};

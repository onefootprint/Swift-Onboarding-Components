import { OnboardingConfig } from '../data';

export type OnboardingRequest = {
  authToken: string;
};

export type OnboardingResponse = {
  onboardingConfig: OnboardingConfig;
};

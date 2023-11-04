import type { OnboardingStatus } from '../data';

export type SessionValidateRequest = {
  validationToken: string;
  configId: string;
};

export type SessionValidateResponse = {
  onboardingConfigurationId: string;
  footprintUserId: string;
  requiresManualReview: boolean;
  status: OnboardingStatus;
  timestamp: string;
};

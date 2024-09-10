import type OnboardingStatus from './onboarding-status';

export type InProgressOnboarding = {
  fpId: string;
  status: OnboardingStatus;
  tenant: {
    name: string;
    websiteUrl?: string;
  };
  timestamp: string;
};

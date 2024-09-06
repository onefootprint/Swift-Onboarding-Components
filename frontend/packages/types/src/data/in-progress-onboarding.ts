import type OnboardingStatus from './onboarding-status';

export type InProgressOnboarding = {
  fp_id: string;
  status: OnboardingStatus;
  tenant: {
    name: string;
    websiteUrl: string;
  };
  timestamp: string;
};

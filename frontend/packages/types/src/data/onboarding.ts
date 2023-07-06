import { InsightEvent } from './insight-event';
import OnboardingStatus from './onboarding-status';

export type Onboarding = {
  configId: string;
  id: string;
  insightEvent?: InsightEvent;
  isAuthorized: boolean;
  name: string;
  requiresManualReview: boolean;
  status: OnboardingStatus;
  timestamp: string;
};

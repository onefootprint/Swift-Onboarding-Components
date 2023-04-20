import { InsightEvent } from './insight-event';
import OnboardingStatus from './onboarding-status';
import { RoleScope } from './role';

export type Onboarding = {
  canAccessPermissions: RoleScope[];
  configId: string;
  id: string;
  insightEvent: InsightEvent;
  isAuthorized: boolean;
  name: string;
  requiresManualReview: boolean;
  status: OnboardingStatus;
  timestamp: string;
};

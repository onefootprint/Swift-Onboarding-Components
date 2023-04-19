import { CollectedDataOption } from './collected-data-option';
import { DataIdentifier } from './di';
import { InsightEvent } from './insight-event';
import OnboardingStatus from './onboarding-status';
import { RoleScope } from './role';

export type Onboarding = {
  canAccessAttributes: DataIdentifier[];
  canAccessData: CollectedDataOption[];
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

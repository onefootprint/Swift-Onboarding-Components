import { CollectedDataOption } from './collected-data-option';
import { InsightEvent } from './insight-event';
import OnboardingStatus from './onboarding-status';
import { UserDataAttribute } from './user-data-attribute';

export type Onboarding = {
  status: OnboardingStatus;
  canAccessData: CollectedDataOption[];
  canAccessDataAttributes: UserDataAttribute[];
  name: string;
  description?: string;
  insightEvent: InsightEvent;
  timestamp: string;
};

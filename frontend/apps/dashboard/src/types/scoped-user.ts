import { DataKinds } from './data-kind';
import { InsightEvent } from './insight-event';
import { OnboardingStatus } from './onboarding-status';

export type ScopedUser = {
  footprintUserId: string;
  populatedDataKinds: DataKinds[];
  startTimestamp: string;
  orderingId: string;
  insightEvent: InsightEvent;
  onboardings: Onboarding[];
};

export type Onboarding = {
  status: OnboardingStatus;
  canAccessDataKinds: DataKinds[];
  name: string;
  description?: string;
  insightEvent: InsightEvent;
  timestamp: string;
};

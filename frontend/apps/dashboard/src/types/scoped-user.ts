import { DataKind } from './data-kind';
import { InsightEvent } from './insight-event';
import { OnboardingStatus } from './onboarding-status';

export type ScopedUser = {
  footprintUserId: string;
  populatedDataKinds: DataKind[];
  startTimestamp: string;
  orderingId: string;
  insightEvent: InsightEvent;
  onboardings: Onboarding[];
};

export type Onboarding = {
  status: OnboardingStatus;
  canAccessDataKinds: DataKind[];
  name: string;
  description?: string;
  insightEvent: InsightEvent;
  timestamp: string;
};

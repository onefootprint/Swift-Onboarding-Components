import { DataKinds } from './data-kind';
import { InsightEvent } from './insight-event';
import { OnboardingStatus } from './onboarding-status';

export type ScopedUser = {
  footprintUserId: string;
  populatedDataKinds: DataKinds[];
  startTimestamp: string;
  orderingId: string;
  onboardings: Onboarding[];
  isPortable: boolean;
};

export type Onboarding = {
  status: OnboardingStatus;
  canAccessData: DataKinds[];
  name: string;
  description?: string;
  insightEvent: InsightEvent;
  timestamp: string;
};

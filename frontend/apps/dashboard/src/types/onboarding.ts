import { DataKind } from './data-kind';
import { InsightEvent } from './insight-event';
import { OnboardingStatus } from './onboarding-status';

export type Onboarding = {
  footprintUserId: string;
  populatedDataKinds: DataKind[];
  startTimestamp: string;
  orderingId: string;
  insightEvent: InsightEvent;
  onboardingLinks: OnboardingLink[];
};

export type OnboardingLink = {
  status: OnboardingStatus;
  canAccessDataKinds: DataKind[];
  name: string;
  description?: string;
  insightEvent: InsightEvent;
  timestamp: string;
};

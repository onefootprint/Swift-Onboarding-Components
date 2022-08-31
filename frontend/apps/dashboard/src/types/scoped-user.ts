import { InsightEvent, UserDataAttribute } from 'types';

import { CollectedDataOption } from './data-kind';
import { OnboardingStatus } from './onboarding-status';

export type ScopedUser = {
  footprintUserId: string;
  identityDataAttributes: UserDataAttribute[];
  startTimestamp: string;
  orderingId: string;
  onboardings: Onboarding[];
  isPortable: boolean;
};

export type Onboarding = {
  status: OnboardingStatus;
  canAccessData: CollectedDataOption[];
  canAccessDataAttributes: UserDataAttribute[];
  name: string;
  description?: string;
  insightEvent: InsightEvent;
  timestamp: string;
};

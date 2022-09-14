import { Onboarding } from './onboarding';
import { UserDataAttribute } from './user-data-attribute';

export type ScopedUser = {
  footprintUserId: string;
  identityDataAttributes: UserDataAttribute[];
  startTimestamp: string;
  orderingId: string;
  onboardings: Onboarding[];
  isPortable: boolean;
};

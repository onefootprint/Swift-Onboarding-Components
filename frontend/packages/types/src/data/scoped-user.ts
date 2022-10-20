import { Onboarding } from './onboarding';
import { UserDataAttribute } from './user-data-attribute';

export type ScopedUser = {
  id: string;
  isPortable: boolean;
  identityDataAttributes: UserDataAttribute[];
  startTimestamp: string;
  onboardings: Onboarding[];
  orderingId: string;
};

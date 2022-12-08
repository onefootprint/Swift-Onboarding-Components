import IdDocDataAttribute from './id-doc-data-attribute';
import { Onboarding } from './onboarding';
import { UserDataAttribute } from './user-data-attribute';

export type ScopedUser = {
  id: string;
  isPortable: boolean;
  identityDataAttributes: UserDataAttribute[];
  startTimestamp: string;
  onboarding?: Onboarding;
  orderingId: string;
  identityDocumentTypes: IdDocDataAttribute[];
};

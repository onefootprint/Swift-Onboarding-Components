import { IdDocInfo } from './id-doc-info';
import { Onboarding } from './onboarding';
import UserDataAttribute from './user-data-attribute';

export type ScopedUser = {
  id: string;
  isPortable: boolean;
  startTimestamp: string;
  onboarding?: Onboarding;
  orderingId: string;
  identityDataAttributes: UserDataAttribute[];
  identityDocumentInfo: IdDocInfo[];
};

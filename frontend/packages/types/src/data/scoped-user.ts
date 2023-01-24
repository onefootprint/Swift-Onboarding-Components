import IdDocType from './id-doc-type';
import { Onboarding } from './onboarding';
import UserDataAttribute from './user-data-attribute';

export type ScopedUser = {
  id: string;
  isPortable: boolean;
  startTimestamp: string;
  onboarding?: Onboarding;
  orderingId: string;
  identityDataAttributes: UserDataAttribute[];
  identityDocumentTypes: IdDocType[];
  selfieDocumentTypes: IdDocType[];
};

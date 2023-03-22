import CdoToDiMap from './cdo-to-di-map';
import { DataIdentifier } from './di';
import IdDocDI from './id-doc-data-attribute';
import { IdDocInfo } from './id-doc-info';
import { Onboarding } from './onboarding';
import UserStatus from './user-status';

export type ScopedUser = {
  id: string;
  attributes: DataIdentifier[];
  isPortable: boolean;
  startTimestamp: string;
  onboarding?: Onboarding;
  orderingId: number;
  identityDocumentInfo: IdDocInfo[];
};

export const getUserIdDocumentAttributes = (scopedUser: ScopedUser) => {
  const idDocAttributes: IdDocDI[] = [];
  Object.entries(IdDocDI).forEach(([, attribute]) => {
    if (scopedUser.attributes.includes(attribute)) {
      idDocAttributes.push(attribute);
    }
  });
  return idDocAttributes;
};

export const getOnboardingCanAccessAttributes = (
  onboarding: Onboarding,
): DataIdentifier[] =>
  onboarding.canAccessData
    .map(collectDataOption => CdoToDiMap[collectDataOption])
    .flat();

export const statusForScopedUser = (scopedUser: ScopedUser) => {
  if (!scopedUser.isPortable) {
    return UserStatus.vaultOnly;
  }
  return (
    (scopedUser.onboarding &&
      scopedUser.onboarding.isAuthorized &&
      (scopedUser.onboarding.status as unknown as UserStatus)) ||
    UserStatus.incomplete
  );
};

export const requiresManualReview = (scopedUser: ScopedUser) => {
  const userStatus = statusForScopedUser(scopedUser);
  return (
    (scopedUser.onboarding?.requiresManualReview &&
      // Cannot manually review if the user is incomplete or vault only
      userStatus !== UserStatus.incomplete &&
      userStatus !== UserStatus.vaultOnly) ||
    false
  );
};

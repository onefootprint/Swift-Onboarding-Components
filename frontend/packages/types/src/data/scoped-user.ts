import { IdDocInfo } from './id-doc-info';
import { InvestorProfileDataAttribute } from './investor-data-attribute';
import { Onboarding } from './onboarding';
import UserDataAttribute from './user-data-attribute';
import UserStatus from './user-status';

// TODO:
// https://linear.app/footprint/issue/FP-2909/add-new-format-for-attributes-in-onboarding
export type ScopedUser = {
  id: string;
  attributes: InvestorProfileDataAttribute[];
  isPortable: boolean;
  startTimestamp: string;
  onboarding?: Onboarding;
  orderingId: number;
  identityDataAttributes: UserDataAttribute[];
  identityDocumentInfo: IdDocInfo[];
};

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

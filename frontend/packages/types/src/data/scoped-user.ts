import { IdDocInfo } from './id-doc-info';
import { Onboarding } from './onboarding';
import UserDataAttribute from './user-data-attribute';
import UserStatus from './user-status';

// TODO: Deprecate UserDataAttribute
// https://linear.app/footprint/issue/FP-2909/add-new-format-for-attributes-in-onboarding
// enum UserAttribute {
//   firstName = 'id.first_name',
//   lastName = 'id.last_name',
//   email = 'id.email',
//   phoneNumber = 'id.phone_number',
//   dob = 'id.dob',
//   ssn9 = 'id.ssn9',
//   ssn4 = 'id.ssn4',
//   addressLine1 = 'id.address_line1',
//   addressLine2 = 'id.address_line2',
//   city = 'id.city',
//   state = 'id.state',
//   country = 'id.country',
//   zip = 'id.zip',
//   passport = 'id_document.passport',
//   selfiePassport = 'selfie.passport',
//   idCard = 'id_document.id_card',
//   selfieIdCard = 'selfie.id_card',
//   driversLicense = 'id_document.driver_license',
//   selfieDriversLicense = 'selfie.driver_license',
// }

export type ScopedUser = {
  id: string;
  isPortable: boolean;
  startTimestamp: string;
  onboarding?: Onboarding;
  orderingId: number;
  identityDataAttributes: UserDataAttribute[];
  identityDocumentInfo: IdDocInfo[];
};

export const statusForScopedUser = (su: ScopedUser) => {
  if (!su.isPortable) {
    return UserStatus.vaultOnly;
  }
  return (
    (su.onboarding &&
      su.onboarding.isAuthorized &&
      (su.onboarding.status as unknown as UserStatus)) ||
    UserStatus.incomplete
  );
};

export const requiresManualReview = (su: ScopedUser) => {
  const userStatus = statusForScopedUser(su);
  return (
    (su.onboarding?.requiresManualReview &&
      // Cannot manually review if the user is incomplete or vault only
      userStatus !== UserStatus.incomplete &&
      userStatus !== UserStatus.vaultOnly) ||
    false
  );
};

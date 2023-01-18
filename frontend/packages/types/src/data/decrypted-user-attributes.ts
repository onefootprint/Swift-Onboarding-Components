import UserDataAttribute from './user-data-attribute';

export type DecryptedUserAttributes = {
  [UserDataAttribute.firstName]: string;
  [UserDataAttribute.lastName]: string;
  [UserDataAttribute.dob]: string;
  [UserDataAttribute.email]: string;
  [UserDataAttribute.ssn9]: string;
  [UserDataAttribute.ssn4]: string;
  [UserDataAttribute.addressLine1]: string;
  [UserDataAttribute.addressLine2]: string;
  [UserDataAttribute.city]: string;
  [UserDataAttribute.state]: string;
  [UserDataAttribute.country]: string;
  [UserDataAttribute.zip]: string;
  [UserDataAttribute.phoneNumber]: string;
};

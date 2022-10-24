import { UserData, UserDataAttribute } from '@onefootprint/types';

export type BasicInformation =
  | NameInformation
  | NameAndDobInformation
  | DobInformation;

export type NameInformation = Required<
  Pick<UserData, UserDataAttribute.firstName | UserDataAttribute.lastName>
>;

export type DobInformation = Required<Pick<UserData, UserDataAttribute.dob>>;

export type NameAndDobInformation = Required<
  Pick<
    UserData,
    | UserDataAttribute.firstName
    | UserDataAttribute.lastName
    | UserDataAttribute.dob
  >
>;

export type ResidentialAddress =
  | ResidentialZipCodeAndCountry
  | ResidentialAddressFull;

export type ResidentialZipCodeAndCountry = Required<
  Pick<UserData, UserDataAttribute.country | UserDataAttribute.zip>
>;

export type ResidentialAddressFull = Required<
  Pick<
    UserData,
    | UserDataAttribute.country
    | UserDataAttribute.addressLine1
    | UserDataAttribute.addressLine2
    | UserDataAttribute.city
    | UserDataAttribute.zip
    | UserDataAttribute.state
  >
>;

export type SSN4Information = {
  [UserDataAttribute.ssn4]: string;
};

export type SSN9Information = {
  [UserDataAttribute.ssn9]: string;
};

export type SSNInformation = SSN4Information | SSN9Information;

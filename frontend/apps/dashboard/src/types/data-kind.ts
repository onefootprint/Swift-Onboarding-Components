import { UserDataAttribute, UserDataAttributeKey } from 'types';

export enum CollectedDataOption {
  name = 'name',
  dob = 'dob',
  ssn4 = 'ssn4',
  ssn9 = 'ssn9',
  fullAddress = 'full_address',
  partialAddress = 'partial_address',
  email = 'email',
  phoneNumber = 'phone_number',
}

export const dataKindToType = Object.fromEntries(
  Object.entries(UserDataAttribute).map(x => [x[1], x[0]]),
) as Record<UserDataAttribute, UserDataAttributeKey>;

export const ALL_FIELDS: UserDataAttributeKey[] = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'ssn9',
  'ssn4',
  'dob',
  'country',
  'addressLine1',
  'addressLine2',
  'city',
  'zip',
  'state',
];

export const dataKindToDisplayName: Record<string, String> = {
  [UserDataAttribute.firstName]: 'First name',
  [UserDataAttribute.lastName]: 'Last name',
  [UserDataAttribute.email]: 'Email',
  [UserDataAttribute.phoneNumber]: 'Phone number',
  [UserDataAttribute.ssn9]: 'SSN (Full)',
  [UserDataAttribute.ssn4]: 'SSN (Last 4)',
  [UserDataAttribute.dob]: 'Date of birth',
  [UserDataAttribute.addressLine1]: 'Address line 1',
  [UserDataAttribute.addressLine2]: 'Address line 2',
  [UserDataAttribute.city]: 'City',
  [UserDataAttribute.state]: 'State',
  [UserDataAttribute.zip]: 'Zip code',
  [UserDataAttribute.country]: 'Country',
};

export type DecryptedUserAttributes = Record<UserDataAttributeKey, string>;

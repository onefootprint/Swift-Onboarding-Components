export enum UserDataAttribute {
  firstName = 'first_name',
  lastName = 'last_name',
  email = 'email',
  phoneNumber = 'phone_number',
  dob = 'dob',
  ssn9 = 'ssn9',
  ssn4 = 'ssn4',
  addressLine1 = 'address_line1',
  addressLine2 = 'address_line2',
  city = 'city',
  state = 'state',
  country = 'country',
  zip = 'zip',
}

export const UserDataAttributeKeys: UserDataAttributeKey[] = [
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

export type UserDataAttributeKey = keyof typeof UserDataAttribute;

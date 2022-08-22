export enum DataKinds {
  firstName = 'first_name',
  lastName = 'last_name',
  email = 'email',
  phoneNumber = 'phone_number',
  ssn9 = 'ssn9',
  ssn4 = 'ssn4',
  dob = 'dob',
  addressLine1 = 'address_line1',
  addressLine2 = 'address_line2',
  city = 'city',
  state = 'state',
  zip = 'zip',
  country = 'country',
}

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

export type DataKind = keyof typeof DataKinds;

export const dataKindToType = Object.fromEntries(
  Object.entries(DataKinds).map(x => [x[1], x[0]]),
) as Record<DataKinds, DataKind>;

export const ALL_FIELDS: DataKind[] = [
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

export const dataKindToDisplayName: Record<DataKinds, String> = {
  [DataKinds.firstName]: 'First name',
  [DataKinds.lastName]: 'Last name',
  [DataKinds.email]: 'Email',
  [DataKinds.phoneNumber]: 'Phone number',
  [DataKinds.ssn9]: 'SSN',
  [DataKinds.ssn4]: 'SSN last four',
  [DataKinds.dob]: 'Date of birth',
  [DataKinds.addressLine1]: 'Address line 1',
  [DataKinds.addressLine2]: 'Address line 2',
  [DataKinds.city]: 'City',
  [DataKinds.state]: 'State',
  [DataKinds.zip]: 'Zip code',
  [DataKinds.country]: 'Country',
};

export type DecryptedUserAttributes = Record<DataKind, string>;

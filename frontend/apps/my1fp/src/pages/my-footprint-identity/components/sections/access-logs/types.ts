import { InsightEvent } from 'src/types';

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

export const dataKindToDisplayName: Record<string, String> = {
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

export enum AccessLogKind {
  Decrypt = 'decrypt',
  Update = 'update',
}

export type AccessLog = {
  targets: string[];
  kind: AccessLogKind;
  fpUserId: string;
  reason: string;
  tenantId: string;
  timestamp: string;
  principal?: string;
  insightEvent?: InsightEvent;
};

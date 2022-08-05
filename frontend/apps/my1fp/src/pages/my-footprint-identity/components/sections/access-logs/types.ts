import { InsightEvent } from 'src/types';

export enum DataKind {
  firstName = 'first_name',
  lastName = 'last_name',
  email = 'email',
  phoneNumber = 'phone_number',
  ssn = 'ssn',
  lastFourSsn = 'last_four_ssn',
  dob = 'dob',
  streetAddress = 'street_address',
  streetAddress2 = 'street_address2',
  city = 'city',
  state = 'state',
  zip = 'zip',
  country = 'country',
}

export const dataKindToDisplayName: Record<DataKind, String> = {
  [DataKind.firstName]: 'First name',
  [DataKind.lastName]: 'Last name',
  [DataKind.email]: 'Email',
  [DataKind.phoneNumber]: 'Phone number',
  [DataKind.ssn]: 'SSN',
  [DataKind.lastFourSsn]: 'SSN last four',
  [DataKind.dob]: 'Date of birth',
  [DataKind.streetAddress]: 'Address line 1',
  [DataKind.streetAddress2]: 'Address line 2',
  [DataKind.city]: 'City',
  [DataKind.state]: 'State',
  [DataKind.zip]: 'Zip code',
  [DataKind.country]: 'Country',
};

export type AccessLog = {
  dataKinds: DataKind[];
  fpUserId: string;
  reason: string;
  tenantId: string;
  timestamp: string;
  principal?: string;
  insightEvent?: InsightEvent;
};

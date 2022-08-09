import { InsightEvent } from 'src/types';

export enum DataKinds {
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

export const dataKindToDisplayName: Record<DataKinds, String> = {
  [DataKinds.firstName]: 'First name',
  [DataKinds.lastName]: 'Last name',
  [DataKinds.email]: 'Email',
  [DataKinds.phoneNumber]: 'Phone number',
  [DataKinds.ssn]: 'SSN',
  [DataKinds.lastFourSsn]: 'SSN last four',
  [DataKinds.dob]: 'Date of birth',
  [DataKinds.streetAddress]: 'Address line 1',
  [DataKinds.streetAddress2]: 'Address line 2',
  [DataKinds.city]: 'City',
  [DataKinds.state]: 'State',
  [DataKinds.zip]: 'Zip code',
  [DataKinds.country]: 'Country',
};

export type AccessLog = {
  dataKinds: DataKinds[];
  fpUserId: string;
  reason: string;
  tenantId: string;
  timestamp: string;
  principal?: string;
  insightEvent?: InsightEvent;
};

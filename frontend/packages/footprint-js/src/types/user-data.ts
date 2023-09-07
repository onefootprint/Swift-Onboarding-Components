export const FOOTPRINT_USER_DATA_KEYS = [
  'id.email',
  'id.phone_number',
  'id.first_name',
  'id.last_name',
  'id.dob',
  'id.address_line1',
  'id.address_line2',
  'id.city',
  'id.state',
  'id.country',
  'id.zip',
  'id.ssn9',
  'id.ssn4',
];

export type FootprintUserData = Partial<{
  'id.email': string;
  'id.phone_number': string;
  'id.first_name': string;
  'id.last_name': string;
  'id.dob': string;
  'id.address_line1': string;
  'id.address_line2': string;
  'id.city': string;
  'id.state': string;
  'id.country': string; // 2 letter country code
  'id.zip': string;
  'id.ssn9': string;
  'id.ssn4': string;
  'id.nationality': string; // 2 letter country code
  'id.usLegalStatus': string;
  'id.citizenships': string[]; // array of 2 letter country codes
  'id.visaKind': string;
  'id.visaExpirationDate': string;
}>;

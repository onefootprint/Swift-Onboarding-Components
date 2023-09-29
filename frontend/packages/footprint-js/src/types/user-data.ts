export type FootprintUserData = Partial<{
  'id.email': string;
  'id.phone_number': string;
  'id.first_name': string;
  'id.middle_name': string;
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

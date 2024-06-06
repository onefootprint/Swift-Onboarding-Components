export type Di = Partial<
  {
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
    'id.country': string;
    'id.zip': string;
    'id.ssn9': string;
    'id.ssn4': string;
    'id.nationality': string;
    'id.us_legal_status': string;
    'id.citizenships': string[];
    'id.visa_kind': string;
    'id.visa_expiration_date': string;

    'business.name': string;
    'business.dba': string;
    'business.tin': string;
    'business.website': string;
    'business.phone_number': string;
    'business.address_line1': string;
    'business.address_line2': string;
    'business.city': string;
    'business.state': string;
    'business.country': string;
    'business.zip': string;
  } & {
    [key: `custom.${string}`]: string;
  }
>;

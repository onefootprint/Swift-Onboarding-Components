type CustomProps = { [key: `custom.${string}`]: string };

type IDProps = {
  'id.address_line1': string;
  'id.address_line2': string;
  'id.citizenships': string[]; // array of 2 letter country codes
  'id.city': string;
  'id.country': string; // 2 letter country code
  'id.dob': string;
  'id.drivers_license_number': string;
  'id.drivers_license_state': string;
  'id.email': string;
  'id.first_name': string;
  'id.itin': string;
  'id.last_name': string;
  'id.middle_name': string;
  'id.nationality': string; // 2 letter country code
  'id.phone_number': string;
  'id.ssn4': string;
  'id.ssn9': string;
  'id.state': string;
  'id.us_legal_status': string;
  'id.us_tax_id': string;
  'id.visa_expiration_date': string;
  'id.visa_kind': string;
  'id.zip': string;
};

type BusinessProps = {
  'business.address_line1': string;
  'business.address_line2': string;
  'business.city': string;
  'business.corporation_type': string;
  'business.country': string;
  'business.dba': string;
  'business.formation_date': string;
  'business.formation_state': string;
  'business.name': string;
  'business.phone_number': string;
  'business.state': string;
  'business.tin': string;
  'business.website': string;
  'business.zip': string;

  [key: `business.beneficial_owners[${number}].first_name`]: string;
  [key: `business.beneficial_owners[${number}].middle_name`]: string;
  [key: `business.beneficial_owners[${number}].last_name`]: string;
  [key: `business.beneficial_owners[${number}].email`]: string;
  [key: `business.beneficial_owners[${number}].phone_number`]: string;
  [key: `business.beneficial_owners[${number}].ownership_stake`]: number;

  [key: `business.kyced_beneficial_owners[${number}].first_name`]: string;
  [key: `business.kyced_beneficial_owners[${number}].middle_name`]: string;
  [key: `business.kyced_beneficial_owners[${number}].last_name`]: string;
  [key: `business.kyced_beneficial_owners[${number}].email`]: string;
  [key: `business.kyced_beneficial_owners[${number}].phone_number`]: string;
  [key: `business.kyced_beneficial_owners[${number}].ownership_stake`]: number;
};

export type BootstrapData = Partial<IDProps> & Partial<BusinessProps> & Partial<CustomProps>;

export type FormValues = BootstrapData;

export type FormValuesKeys = keyof FormValues;

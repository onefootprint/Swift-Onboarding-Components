export enum SignalAttribute {
  name = 'name',
  dob = 'dob',
  ssn = 'ssn',
  address = 'address',
  streetAddress = 'street_address',
  city = 'city',
  state = 'state',
  zip = 'zip',
  country = 'country',
  email = 'email',
  phoneNumber = 'phone_number',
  identity = 'identity',
  ipAddress = 'ip_address',
  document = 'document',
}

// TODO: Remove and use translations
// https://linear.app/footprint/issue/FP-1684/deprecate-signalattributetodisplayname
export const signalAttributeToDisplayName: Record<string, String> = {
  [SignalAttribute.name]: 'Name',
  [SignalAttribute.email]: 'Email',
  [SignalAttribute.phoneNumber]: 'Phone number',
  [SignalAttribute.ssn]: 'SSN',
  [SignalAttribute.dob]: 'Date of birth',
  [SignalAttribute.address]: 'Address',
  [SignalAttribute.streetAddress]: 'Street address',
  [SignalAttribute.city]: 'City',
  [SignalAttribute.state]: 'State',
  [SignalAttribute.zip]: 'Zip code',
  [SignalAttribute.country]: 'Country',
  [SignalAttribute.identity]: 'Identity',
  [SignalAttribute.ipAddress]: 'IP address',
  [SignalAttribute.document]: 'Document',
};

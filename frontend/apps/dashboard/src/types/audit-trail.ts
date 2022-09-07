import { Vendor } from './vendor';

export type LivenessCheckInfo = {
  attestations: string[];
  device: string;
  os?: string;
  ipAddress?: string;
  location?: string;
};

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

export enum VerificationInfoStatus {
  Verified = 'verified',
  Failed = 'failed',
}

export type VerificationInfo = {
  attributes: SignalAttribute[];
  vendor: Vendor;
  status: VerificationInfoStatus;
};

export type AuditTrailEvent = {
  kind: 'liveness_check' | 'verification';
  data: LivenessCheckInfo | VerificationInfo;
};

export type AuditTrail = {
  event: AuditTrailEvent;
  timestamp: string;
};

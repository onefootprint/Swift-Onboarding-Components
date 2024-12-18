import type { Attribute, EntityStatus } from './entity';

export enum DupeKind {
  ssn9 = 'ssn9',
  email = 'email',
  phoneNumber = 'phone_number',
  nameDob = 'name_dob',
  deviceId = 'device_id',
  cookieId = 'cookie_id',
  nameSsn4 = 'name_ssn4',
  dobSsn4 = 'dob_ssn4',
  bankRoutingAccount = 'bank_routing_account',
  cardNumberCvc = 'card_number_cvc',
  identityDocumentNumber = 'identity_document_number',
}

export type DuplicateDataItem = {
  dupeKinds: DupeKind[];
  fpId: string;
  startTimestamp: string;
  status: EntityStatus;
  data: Attribute[];
};

export type SameTenantDuplicateData = DuplicateDataItem[];

export type OtherTenantsDuplicateDataSummary = {
  numMatches: number;
  numTenants: number;
};

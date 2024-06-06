import type { Attribute, EntityStatus } from './entity';

export enum DupeKind {
  ssn9 = 'ssn9',
  email = 'email',
  phoneNumber = 'phone_number',
  nameDob = 'name_dob',
  deviceId = 'device_id',
  cookieId = 'cookie_id',
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

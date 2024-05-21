import type { ApiEntityStatus, Attribute, EntityStatus } from './entity';

export enum DupeKind {
  ssn9 = 'ssn9',
  email = 'email',
  phoneNumber = 'phone_number',
  nameDob = 'name_dob',
  deviceId = 'device_id',
  cookieId = 'cookie_id',
}

export type DuplicateDataItem<TStatus = EntityStatus> = {
  dupeKinds: DupeKind[];
  fpId: string;
  startTimestamp: string;
  status: TStatus;
  data: Attribute[];
};

export type SameTenantDuplicateData = DuplicateDataItem<
  ApiEntityStatus | undefined
>[];

export type OtherTenantsDuplicateDataSummary = {
  numMatches: number;
  numTenants: number;
};

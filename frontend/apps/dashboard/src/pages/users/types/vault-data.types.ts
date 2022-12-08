import { IdDocDataAttribute, UserDataAttribute } from '@onefootprint/types';

export type DataValue = string | null; // Null value means encrypted

export type UserVaultData = {
  kycData: Partial<Record<UserDataAttribute, DataValue>>;
  idDoc?: Partial<Record<IdDocDataAttribute, DataValue>>;
};

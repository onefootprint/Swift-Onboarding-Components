import type { IdDI, ValueTypeForIdDI } from '@onefootprint/types';

export type DataValue<T> = {
  value?: T;
  bootstrap?: boolean;
  decrypted?: boolean; // True when populated from decrypted value in vault
  scrubbed?: boolean; // True when it exists in vault but we haven't yet decrypted it
  dirty?: boolean;
};

export type KycData = Partial<{ [K in IdDI]: DataValue<ValueTypeForIdDI<K>> }>;

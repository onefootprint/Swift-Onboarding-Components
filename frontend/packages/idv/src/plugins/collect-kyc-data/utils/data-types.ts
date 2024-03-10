import type { IdDI, ValueTypeForIdDI } from '@onefootprint/types';

type DataValue<T extends IdDI> = {
  value?: ValueTypeForIdDI<T>;
  bootstrap?: boolean;
  decrypted?: boolean; // True when populated from decrypted value in vault
  scrubbed?: boolean; // True when it exists in vault but we haven't yet decrypted it
  disabled?: boolean;
  dirty?: boolean;
};

export type KycData = Partial<{ [K in IdDI]: DataValue<K> }>;

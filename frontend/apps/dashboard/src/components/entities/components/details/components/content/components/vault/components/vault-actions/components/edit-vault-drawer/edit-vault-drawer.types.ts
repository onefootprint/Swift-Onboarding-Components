import type { DataIdentifier, VaultValue } from '@onefootprint/types';

export type EditFormData = Record<string, Record<string, VaultValue>>; // Eg {id: {first_name: ..., last_name: ...}}

export type EditSubmitData = Partial<Record<DataIdentifier, VaultValue>>;

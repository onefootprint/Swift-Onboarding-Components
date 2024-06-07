import type { DataIdentifier } from '../data/di';

export type EntitiesVaultDecryptRequest = {
  authToken: string;
  field: DataIdentifier;
};

export type EntitiesVaultDecryptResponse = Partial<Record<DataIdentifier, string | undefined>>;

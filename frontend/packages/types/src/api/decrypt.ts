import type { DataIdentifier } from '../data';

export type DecryptRequest = {
  entityId: string;
  fields: DataIdentifier[];
  reason: string;
};

export type DecryptResponse = Partial<Record<DataIdentifier, string | undefined>>;

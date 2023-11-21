import type { DataIdentifier, VaultValue } from '../data';

export type EditRequest = {
  entityId: string;
  fields: Partial<Record<DataIdentifier, VaultValue>>;
};

export type EditResponse = Partial<Record<DataIdentifier, string | undefined>>;

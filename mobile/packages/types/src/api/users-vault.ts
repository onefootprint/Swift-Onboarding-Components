import type { DataIdentifier } from '../data/di';

export type UsersVaultRequest = {
  authToken: string;
  data: Partial<Record<DataIdentifier, string>>;
};

export type UsersVaultResponse = {};

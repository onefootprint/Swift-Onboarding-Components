import type { DataIdentifier } from '../data';

export type DecryptUserRequest = {
  fields: DataIdentifier[];
  authToken: string;
};

export type DecryptUserResponse = Partial<Record<DataIdentifier, string | string[] | undefined>>;

import { DataIdentifier } from '../data';

export type DecryptRequest = {
  userId: string;
  fields: DataIdentifier[];
  reason: string;
};

export type DecryptResponse = Partial<
  Record<DataIdentifier, string | undefined>
>;

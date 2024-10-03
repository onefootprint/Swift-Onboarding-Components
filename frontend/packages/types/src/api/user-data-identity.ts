import type { IdDI, InvestorProfileDI, VaultValue } from '../data';

export const ALLOW_EXTRA_FIELDS_HEADER = 'x-fp-allow-extra-fields';

type Data = Partial<Record<IdDI | InvestorProfileDI, VaultValue>>;

export type UserDataRequest = {
  data: Data;
  bootstrapDis: (IdDI | InvestorProfileDI)[];
  authToken: string;
  allowExtraFields?: boolean;
  speculative?: boolean;
};

export type UserDataResponse = { data: Data };

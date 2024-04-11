import type { IdDI, InvestorProfileDI, VaultValue } from '../data';

export const ALLOW_EXTRA_FIELDS_HEADER = 'x-fp-allow-extra-fields';

export type UserDataError = {
  error: {
    message: Partial<Record<IdDI, string>> | string;
  };
};

export type UserDataRequest = {
  data: Partial<Record<IdDI | InvestorProfileDI, VaultValue>>;
  bootstrapDis: (IdDI | InvestorProfileDI)[];
  authToken: string;
  allowExtraFields?: boolean;
  speculative?: boolean;
};

export type UserDataResponse = { data: string };

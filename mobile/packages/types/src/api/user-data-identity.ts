import type { IdDI, InvestorProfileDI, VaultValue } from '../data';

export type UserDataRequest = {
  data: Partial<Record<IdDI | InvestorProfileDI, VaultValue>>;
  authToken: string;
  allowExtraFields?: boolean;
  speculative?: boolean;
};

export type UserDataResponse = { data: string };

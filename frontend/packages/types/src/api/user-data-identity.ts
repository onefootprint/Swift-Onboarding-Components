import { IdDI, InvestorProfileDI, VaultValue } from '../data';

export type UserDataRequest = {
  data: Partial<Record<IdDI | InvestorProfileDI, VaultValue>>;
  authToken: string;
  speculative?: boolean;
};

export type UserDataResponse = { data: string };

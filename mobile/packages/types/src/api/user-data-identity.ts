import { InvestorProfileData, UserData } from '../data';

export type UserDataRequest = {
  data: UserData | InvestorProfileData;
  authToken: string;
  speculative?: boolean;
};

export type UserDataResponse = { data: string };

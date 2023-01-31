import { UserData } from '../data';

export type UserDataRequest = {
  data: UserData;
  authToken: string;
  speculative?: boolean;
};

export type UserDataResponse = { data: string };

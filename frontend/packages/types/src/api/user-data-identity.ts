import { UserDataObj } from '../data';

export type UserDataRequest = {
  data: UserDataObj;
  authToken: string;
  speculative?: boolean;
};

export type UserDataResponse = { data: string };

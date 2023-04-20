import { BusinessData } from '../data';

export type BusinessDataRequest = {
  data: BusinessData;
  authToken: string;
  speculative?: boolean;
};

export type BusinessDataResponse = { data: string };

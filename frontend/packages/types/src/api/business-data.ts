import { BusinessData, BusinessDIData } from '../data';

export type BusinessDataRequest = {
  data: BusinessData | BusinessDIData;
  authToken: string;
  speculative?: boolean;
};

export type BusinessDataResponse = { data: string };

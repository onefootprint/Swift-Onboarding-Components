import type { BusinessDIData } from '../data';

export type BusinessDataRequest = {
  data: BusinessDIData;
  authToken: string;
  speculative?: boolean;
};

export type BusinessDataResponse = { data: BusinessDIData };

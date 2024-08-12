import type { BusinessDIData } from '../data';

export type BusinessDataRequest = {
  data: BusinessDIData;
  authToken: string;
};

export type BusinessDataResponse = { data: BusinessDIData };

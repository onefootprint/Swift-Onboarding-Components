import { ScopedBusiness } from '../data';

export type BusinessesRequest = {
  cursor: string | undefined;
  search: string | undefined;
  page_size: string;
  statuses: string | undefined;
  timestamp_gte: string | Date | undefined;
  timestamp_lte: string | undefined;
};

export type BusinessesResponse = ScopedBusiness[];

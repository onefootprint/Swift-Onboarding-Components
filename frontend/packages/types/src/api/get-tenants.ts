import type { Tenant } from '../data/tenant';

export type GetTenantsRequest = {
  search?: string;
  page_size?: string;
};

export type GetTenantsResponse = Tenant[];

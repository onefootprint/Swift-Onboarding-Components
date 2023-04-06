import type { BusinessOwner } from '../data/business-owner';

export type GetBusinessOwnersRequest = {
  id: string;
};

export type GetBusinessOwnersResponse = BusinessOwner[];

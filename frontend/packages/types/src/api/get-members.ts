import type { Member } from '../data';

export type GetMembersRequest = {
  search?: string;
};

export type GetMembersResponse = Member[];

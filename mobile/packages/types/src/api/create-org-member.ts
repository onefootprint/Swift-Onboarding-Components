import type { Member } from '../data';

export type CreateMembersRequest = {
  email: string;
  roleId: string;
  redirectUrl: string;
};

export type CreateMembersResponse = Member[];

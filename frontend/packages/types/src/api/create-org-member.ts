import type { Member } from '../data';

export type CreateMembersRequest = {
  email: string;
  roleId: string;
  redirectUrl: string;
  omitEmailInvite: boolean;
};

export type CreateMembersResponse = Member[];

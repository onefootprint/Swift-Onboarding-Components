import { OrgMember } from '../data';

export type GetOrgMembersRequest = {
  search?: string;
};

export type GetOrgMembersResponse = OrgMember[];

import { OrgMember } from '../data';

export type CreateOrgMembersRequest = {
  email: string;
  roleId: string;
  redirectUrl: string;
};

export type CreateOrgMembersResponse = OrgMember[];

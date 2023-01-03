import { OrgMember } from '../data/org-member';
import { Organization } from '../data/organization';

export type OrgAssumeRoleResponse = {
  user: OrgMember;
  tenant: Organization;
};

export type OrgAssumeRoleRequest = {
  tenantId: string;
  authToken: string;
};

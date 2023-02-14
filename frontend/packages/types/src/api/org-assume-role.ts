import { Member } from '../data/org-member';
import { Organization } from '../data/organization';

export type OrgAssumeRoleResponse = {
  user: Member;
  tenant: Organization;
};

export type OrgAssumeRoleRequest = {
  tenantId: string;
  authToken: string;
};

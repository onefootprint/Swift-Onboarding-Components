import type { Member } from '../data/org-member';
import type { Organization } from '../data/organization';

export type OrgAssumeRoleResponse = {
  token: string;
  user: Member;
  tenant: Organization;
};

export type OrgAssumeRoleRequest = {
  tenantId: string;
  authToken: string;
};

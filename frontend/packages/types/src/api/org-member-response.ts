import type { RoleScope } from '../data';
import type { Organization } from '../data/organization';

export type OrgMemberResponse = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAssumedSession?: boolean;
  isFirmEmployee?: boolean;
  scopes: RoleScope[];
  tenant: Organization;
};

import { RoleScope } from '../data';
import { Organization } from '../data/organization';

export type OrgMemberResponse = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAssumedSession?: boolean;
  scopes: RoleScope[];
  tenant: Organization;
};

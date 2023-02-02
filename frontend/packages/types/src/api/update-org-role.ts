import { OrgRole, OrgRoleScope } from '../data';

export type UpdateOrgRoleRequest = {
  name: string;
  scopes: OrgRoleScope[];
};

export type UpdateOrgRoleResponse = OrgRole;

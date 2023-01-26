import { OrgRole, OrgRoleScope } from '../data';

export type CreateOrgRoleRequest = {
  name: string;
  scopes: OrgRoleScope[];
};

export type CreateOrgRoleResponse = OrgRole;

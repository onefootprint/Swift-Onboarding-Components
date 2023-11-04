import type { Role, RoleScope } from '../data';

export type UpdateRoleRequest = {
  name: string;
  scopes: RoleScope[];
};

export type UpdateRoleResponse = Role;

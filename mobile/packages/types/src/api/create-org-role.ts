import type { Role, RoleScope } from '../data';

export type CreateRoleRequest = {
  name: string;
  scopes: RoleScope[];
};

export type CreateRoleResponse = Role;

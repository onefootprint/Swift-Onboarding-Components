import type { Role, RoleKind, RoleScope } from '../data';

export type CreateRoleRequest = {
  name: string;
  scopes: RoleScope[];
  kind?: RoleKind;
};

export type CreateRoleResponse = Role;

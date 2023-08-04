import { Role, RoleKind } from '../data';

export type GetRolesRequest = {
  search?: string;
  kind: RoleKind;
};

export type GetRolesResponse = Role[];

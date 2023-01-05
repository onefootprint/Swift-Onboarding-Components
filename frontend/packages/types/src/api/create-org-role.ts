import { OrgRolePermission } from '../data';

export type CreateOrgRoleRequest = {
  authToken: string;
  name: string;
  scopes: OrgRolePermission[];
};

export type CreateOrgRoleResponse = {
  createdAt: string;
  id: string;
  name: string;
  scopes: OrgRolePermission[];
};

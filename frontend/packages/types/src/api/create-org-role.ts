import { OrgRolePermission } from '../data';

export type CreateOrgRoleRequest = {
  authToken: string;
  name: string;
  permissions: OrgRolePermission[];
};

export type CreateOrgRoleResponse = {
  createdAt: string;
  id: string;
  name: string;
  permissions: OrgRolePermission[];
};

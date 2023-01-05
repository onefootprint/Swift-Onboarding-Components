import { OrgRolePermission } from './org-role-permission';

export type OrgRole = {
  id: string;
  name: string;
  scopes: OrgRolePermission[];
  createdAt: string;
};

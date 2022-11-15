import { OrgRolePermission } from './org-role-permission';

export type OrgRole = {
  id: string;
  name: string;
  permissions: OrgRolePermission[];
  createdAt: string;
};

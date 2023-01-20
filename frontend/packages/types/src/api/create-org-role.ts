import { OrgRoleScope } from '../data';

export type CreateOrgRoleRequest = {
  authToken: string;
  name: string;
  scopes: OrgRoleScope[];
};

export type CreateOrgRoleResponse = {
  createdAt: string;
  id: string;
  name: string;
  scopes: OrgRoleScope[];
};

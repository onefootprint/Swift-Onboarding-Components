import { OrgRole } from '../data';

export type GetOrgRolesRequest = {
  search?: string;
};

export type GetOrgRolesResponse = OrgRole[];

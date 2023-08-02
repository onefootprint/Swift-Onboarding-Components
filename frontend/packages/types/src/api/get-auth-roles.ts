import type { Organization } from '../data';

export type GetAuthRolesRequest = {
  authToken: string;
};

export type GetAuthRolesOrg = Organization & {
  isAuthMethodSupported: boolean;
};

export type GetAuthRoleResponse = GetAuthRolesOrg[];

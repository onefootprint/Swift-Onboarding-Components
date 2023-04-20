import type { Organization } from '../data';

export type GetAuthRolesRequest = {
  authToken: string;
};

export type GetAuthRoleResponse = Organization[];

import { Role } from '../data';

export type GetRolesRequest = {
  search?: string;
};

export type GetRolesResponse = Role[];

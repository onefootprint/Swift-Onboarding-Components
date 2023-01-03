import { Organization, OrgMember } from '../data';

export type OrgAuthLoginResponse = {
  createdNewTenant: boolean;
  requiresOnboarding: boolean;
  authToken: string;

  user: OrgMember | null;
  tenant: Organization | null;
};

export type OrgAuthLoginRequest = string;

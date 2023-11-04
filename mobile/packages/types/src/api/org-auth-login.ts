import type { Member, Organization } from '../data';

export type OrgAuthLoginResponse = {
  createdNewTenant: boolean;
  isFirstLogin: boolean;
  requiresOnboarding: boolean;
  authToken: string;
  user: Member | null;
  tenant: Organization | null;
};

export type OrgAuthLoginRequest = string;

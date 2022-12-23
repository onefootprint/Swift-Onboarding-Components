export type OrgAuthLoginResponse = {
  auth: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  newTenant: boolean; // TODO: shouldnt this be createdNewTenant
  sandboxRestricted: boolean;
  tenantName: string;
  requiresOnboarding: boolean;
};

export type OrgAuthLoginRequest = string;

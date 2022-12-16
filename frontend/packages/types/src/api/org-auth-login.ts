export type OrgAuthLoginResponse = {
  auth: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  newTenant: boolean;
  sandboxRestricted: boolean;
  tenantName: string;
};

export type OrgAuthLoginRequest = string;

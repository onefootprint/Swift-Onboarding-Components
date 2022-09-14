export type OrgAuthLoginResponse = {
  auth: string;
  email: string;
  firstName: string;
  lastName: string;
  newTenant: boolean;
  sandboxRestricted: boolean;
  tenantName: string;
};

export type OrgAuthLoginRequest = string;

import type { Member, Organization } from '../data';

export type OrgAuthLoginRequest = {
  code: string;
  requestOrgId?: string;
  loginTarget: OrgAuthLoginTarget;
};

export enum OrgAuthLoginTarget {
  TenantDashboard = 'tenant_dashboard',
  PartnerTenantDashboard = 'partner_tenant_dashboard',
}

export type OrgAuthLoginResponse = {
  createdNewTenant: boolean;
  isFirstLogin: boolean;
  requiresOnboarding: boolean;
  authToken: string;
  user: Member | null;
  tenant: Organization | null;
};

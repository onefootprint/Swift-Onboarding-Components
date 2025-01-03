import type { TenantBusinessInfo } from '../api/get-tenants';

export type Tenant = {
  id: string;
  name: string;
  domains: string[];
  allowDomainAccess: boolean;
  isLive: boolean;
  isProdKycPlaybookRestricted: boolean;
  isProdKybPlaybookRestricted: boolean;
  supportedAuthMethods: string[] | null;
  numLiveVaults: number;
  numSandboxVaults: number;
  createdAt: string;
  superTenantId: string | null;
  businessInfo?: TenantBusinessInfo;
};

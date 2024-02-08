import type { Organization, OrganizationSize } from '../data';

export type UpdateOrgRequest = Partial<{
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  companySize: OrganizationSize | null;
  allowDomainAccess: boolean | null;
  supportEmail: string | null;
  supportPhone: string | null;
  supportWebsite: string | null;
}>;

export type UpdateOrgResponse = Organization;

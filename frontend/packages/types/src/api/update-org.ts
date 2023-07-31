import { Organization, OrganizationSize } from '../data';

export type UpdateOrgRequest = Partial<{
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  companySize: OrganizationSize | null;
  allowDomainAccess: boolean | null;
}>;

export type UpdateOrgResponse = Organization;

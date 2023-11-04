import type { Organization, OrganizationSize } from '../data';

export type UpdateOrgRequest = Partial<{
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  companySize: OrganizationSize | null;
}>;

export type UpdateOrgResponse = Organization;

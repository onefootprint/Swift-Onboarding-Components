import type { TenantPreviewApi } from '../api/get-tenants';

export enum OrganizationSize {
  s1_to10 = 's1_to10',
  s11_to50 = 's11_to50',
  s51_to100 = 's51_to100',
  s101_to1000 = 's101_to1000',
  s1001_plus = 's1001_plus',
}

export type Organization = {
  allowDomainAccess: boolean;
  allowedPreviewApis: TenantPreviewApi[];
  companySize: OrganizationSize | null;
  domains: string[];
  id: string;
  isDomainAlreadyClaimed: boolean | null;
  isProdKybPlaybookRestricted: boolean;
  isProdKycPlaybookRestricted: boolean;
  isProdAuthPlaybookRestricted: boolean;
  isProdNeuroEnabled: boolean;
  isProdSentilinkEnabled: boolean;
  isSandboxRestricted: boolean;
  logoUrl: string | null;
  name: string;
  parent: ParentOrganization | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  supportWebsite?: string | null;
  websiteUrl: string | null;
};

export type ParentOrganization = {
  name: string;
  id: string;
};

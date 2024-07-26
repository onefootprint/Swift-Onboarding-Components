import { TenantPreviewApi } from '../api/get-tenants';

export enum OrganizationSize {
  s1_to10 = `s1_to10`,
  s11_to50 = `s11_to50`,
  s51_to100 = `s51_to100`,
  s101_to1000 = `s101_to1000`,
  s1001_plus = `s1001_plus`,
}

export type Organization = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  companySize: OrganizationSize | null;
  isSandboxRestricted: boolean;
  domains: string[];
  allowDomainAccess: boolean;
  isDomainAlreadyClaimed: boolean | null;
  isProdKycPlaybookRestricted: boolean;
  isProdKybPlaybookRestricted: boolean;
  supportEmail?: string | null;
  supportPhone?: string | null;
  supportWebsite?: string | null;
  parent: ParentOrganization | null;
  allowedPreviewApis: TenantPreviewApi[];
};

export type ParentOrganization = {
  name: string;
  id: string;
};

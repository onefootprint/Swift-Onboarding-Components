import type {
  TenantBusinessInfo,
  TenantDetail,
  TenantPreviewApi,
  TenantSupportedAuthMethod,
} from '@onefootprint/types/src/api/get-tenants';
import type { SelectOption } from '@onefootprint/ui';

export type UpdateTenantFormData = {
  name: string;
  superTenantId: string | null;
  isDemoTenant: boolean;
  domains: string;
  allowDomainAccess: boolean;
  notSandboxRestricted: boolean;
  notIsProdKycPlaybookRestricted: boolean;
  notIsProdKybPlaybookRestricted: boolean;
  notIsProdAuthPlaybookRestricted: boolean;
  supportedAuthMethods: SelectOption<TenantSupportedAuthMethod>[];
  allowedPreviewApis: SelectOption<TenantPreviewApi>[];
  companyName: string;
  phone: string;
  addressLine1: string;
  city: string;
  zip: string;
};

export const convertFormData = (tenant: TenantDetail, formData: UpdateTenantFormData) => {
  const data: Record<string, unknown> = {};

  if (formData.name !== tenant.name) {
    data.name = formData.name;
  }

  if (formData.superTenantId !== tenant.superTenantId) {
    data.superTenantId = formData.superTenantId;
  }

  if (formData.isDemoTenant !== tenant.isDemoTenant) {
    data.isDemoTenant = formData.isDemoTenant;
  }

  const domains = formData.domains
    .split(',')
    .map(d => d.trim())
    .filter(Boolean);
  if (JSON.stringify(domains) !== JSON.stringify(tenant.domains)) {
    data.domains = domains;
  }

  if (formData.allowDomainAccess !== tenant.allowDomainAccess) {
    data.allowDomainAccess = formData.allowDomainAccess;
  }

  if (!formData.notSandboxRestricted !== tenant.sandboxRestricted) {
    data.sandboxRestricted = !formData.notSandboxRestricted;
  }

  if (!formData.notIsProdKycPlaybookRestricted !== tenant.isProdKycPlaybookRestricted) {
    data.isProdKycPlaybookRestricted = !formData.notIsProdKycPlaybookRestricted;
  }

  if (!formData.notIsProdKybPlaybookRestricted !== tenant.isProdKybPlaybookRestricted) {
    data.isProdKybPlaybookRestricted = !formData.notIsProdKybPlaybookRestricted;
  }

  if (!formData.notIsProdAuthPlaybookRestricted !== tenant.isProdAuthPlaybookRestricted) {
    data.isProdAuthPlaybookRestricted = !formData.notIsProdAuthPlaybookRestricted;
  }

  const supportedAuthMethods = formData.supportedAuthMethods.map(o => o.value);
  if (JSON.stringify(supportedAuthMethods) !== JSON.stringify(tenant.supportedAuthMethods)) {
    data.supportedAuthMethods = supportedAuthMethods;
  }

  const allowedPreviewApis = formData.allowedPreviewApis.map(o => o.value);
  if (JSON.stringify(allowedPreviewApis) !== JSON.stringify(tenant.allowedPreviewApis)) {
    data.allowedPreviewApis = allowedPreviewApis;
  }

  // Handle business info fields
  const hasBusinessInfoChanges =
    formData.companyName !== (tenant.businessInfo?.companyName || '') ||
    formData.phone !== (tenant.businessInfo?.phone || '') ||
    formData.addressLine1 !== (tenant.businessInfo?.addressLine1 || '') ||
    formData.city !== (tenant.businessInfo?.city || '') ||
    formData.zip !== (tenant.businessInfo?.zip || '');

  if (hasBusinessInfoChanges) {
    data.businessInfo = {
      companyName: formData.companyName,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      city: formData.city,
      zip: formData.zip,
      state: tenant.businessInfo?.state || '', // Keep existing state if any
    } as TenantBusinessInfo;
  }

  return data;
};

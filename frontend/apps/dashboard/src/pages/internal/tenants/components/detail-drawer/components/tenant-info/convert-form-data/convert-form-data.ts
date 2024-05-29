import type { TenantDetail } from '@onefootprint/types';
import type {
  TenantPreviewApi,
  TenantSupportedAuthMethod,
} from '@onefootprint/types/src/api/get-tenants';
import type { SelectOption } from '@onefootprint/ui';
import type { PrivatePatchTenantRequest } from 'src/pages/internal/tenants/components/detail-drawer/hooks/use-update-tenant';

const ifChanged = <T>(a: T, b: T) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    const isArrayEq = a.length === b.length && a.every(x => b.includes(x));
    return !isArrayEq ? a : undefined;
  }
  return a !== b ? a : undefined;
};

export type UpdateTenantFormData = {
  name: string;
  superTenantId?: string;
  isDemoTenant: boolean;

  domains: string;
  allowDomainAccess: boolean;

  notSandboxRestricted: boolean;
  notIsProdKycPlaybookRestricted: boolean;
  notIsProdKybPlaybookRestricted: boolean;
  notIsProdAuthPlaybookRestricted: boolean;

  supportedAuthMethods: SelectOption<TenantSupportedAuthMethod>[];
  allowedPreviewApis: SelectOption<TenantPreviewApi>[];
};

export const convertFormData = (
  tenant: TenantDetail,
  formData: UpdateTenantFormData,
): PrivatePatchTenantRequest => ({
  name: ifChanged(formData.name, tenant.name),
  // Empty super tenant ID is serialized as null to clear out
  superTenantId: ifChanged(
    formData.superTenantId || null,
    tenant.superTenantId,
  ),
  isDemoTenant: ifChanged(formData.isDemoTenant, tenant.isDemoTenant),
  domains: ifChanged(
    formData.domains.length ? formData.domains.split(',') : [],
    tenant.domains,
  ),
  allowDomainAccess: ifChanged(
    formData.allowDomainAccess,
    tenant.allowDomainAccess,
  ),
  sandboxRestricted: ifChanged(
    !formData.notSandboxRestricted,
    tenant.sandboxRestricted,
  ),
  isProdKycPlaybookRestricted: ifChanged(
    !formData.notIsProdKycPlaybookRestricted,
    tenant.isProdKycPlaybookRestricted,
  ),
  isProdKybPlaybookRestricted: ifChanged(
    !formData.notIsProdKybPlaybookRestricted,
    tenant.isProdKybPlaybookRestricted,
  ),
  isProdAuthPlaybookRestricted: ifChanged(
    !formData.notIsProdAuthPlaybookRestricted,
    tenant.isProdAuthPlaybookRestricted,
  ),
  // Empty supported auth methods is serialized as null to clear out
  supportedAuthMethods: ifChanged(
    formData.supportedAuthMethods?.length
      ? formData.supportedAuthMethods.map(({ value }) => value)
      : null,
    tenant.supportedAuthMethods || null,
  ),
  allowedPreviewApis: ifChanged(
    formData.allowedPreviewApis.map(({ value }) => value),
    tenant.allowedPreviewApis,
  ),
});

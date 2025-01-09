import type { TenantDetail } from '@onefootprint/types';
import type {
  TenantBusinessInfo,
  TenantPreviewApi,
  TenantSupportedAuthMethod,
} from '@onefootprint/types/src/api/get-tenants';
import type { SelectOption } from '@onefootprint/ui';
import type { PrivatePatchTenantRequest } from 'src/pages/internal/tenants/components/detail-drawer/hooks/use-update-tenant';

import { ifChanged, strOrNull } from '../../../utils/form-data-utils';

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

  companyName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
};

export const convertFormData = (tenant: TenantDetail, formData: UpdateTenantFormData): PrivatePatchTenantRequest => ({
  name: ifChanged(formData.name, tenant.name),
  superTenantId: ifChanged(strOrNull(formData.superTenantId), tenant.superTenantId),
  isDemoTenant: ifChanged(formData.isDemoTenant, tenant.isDemoTenant),
  domains: ifChanged(formData.domains.length ? formData.domains.split(',') : [], tenant.domains),
  allowDomainAccess: ifChanged(formData.allowDomainAccess, tenant.allowDomainAccess),
  sandboxRestricted: ifChanged(!formData.notSandboxRestricted, tenant.sandboxRestricted),
  isProdKycPlaybookRestricted: ifChanged(!formData.notIsProdKycPlaybookRestricted, tenant.isProdKycPlaybookRestricted),
  isProdKybPlaybookRestricted: ifChanged(!formData.notIsProdKybPlaybookRestricted, tenant.isProdKybPlaybookRestricted),
  isProdAuthPlaybookRestricted: ifChanged(
    !formData.notIsProdAuthPlaybookRestricted,
    tenant.isProdAuthPlaybookRestricted,
  ),
  // Empty supported auth methods is serialized as null to clear out
  supportedAuthMethods: ifChanged(
    formData.supportedAuthMethods?.length ? formData.supportedAuthMethods.map(({ value }) => value) : null,
    tenant.supportedAuthMethods || null,
  ),
  allowedPreviewApis: ifChanged(
    formData.allowedPreviewApis.map(({ value }) => value),
    tenant.allowedPreviewApis,
  ),
  // update all the data together
  businessInfo: businessInfo(formData, tenant.businessInfo),
});

// currently businessInfo must all be updated together
function businessInfo(
  formData: UpdateTenantFormData,
  _businessInfo: TenantBusinessInfo | undefined,
): TenantBusinessInfo | undefined {
  // don't allow any empty fields
  const fields = [
    formData.companyName,
    formData.phone,
    formData.addressLine1,
    formData.city,
    formData.state,
    formData.zip,
  ];
  if (fields.filter(v => v === '').length > 0) {
    return undefined;
  }

  return {
    companyName: formData.companyName,
    phone: formData.phone,
    addressLine1: formData.addressLine1,
    city: formData.city,
    state: formData.state,
    zip: formData.zip,
  };
}

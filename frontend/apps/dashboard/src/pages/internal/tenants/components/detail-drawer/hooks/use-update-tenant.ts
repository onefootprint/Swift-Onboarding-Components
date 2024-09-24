import request from '@onefootprint/request';
import type {
  TenantBillingProfilePrices,
  TenantDetail,
  TenantPreviewApi,
  TenantSupportedAuthMethod,
} from '@onefootprint/types/src/api/get-tenants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

export type UpdateTenantVendorControl = {
  idologyEnabled?: boolean;
  experianEnabled?: boolean;
  lexisEnabled?: boolean;
  experianSubscriberCode?: string | null;
  middeskApiKey?: string | null;
};

export type UpdateTenantBillingProfile = {
  prices?: TenantBillingProfilePrices;
  billingEmail?: string | null;
  omitBilling?: boolean;
  sendAutomatically?: boolean;
};

export type PrivatePatchTenantRequest = {
  name?: string;
  superTenantId?: string | null;
  isDemoTenant?: boolean;

  domains?: string[];
  allowDomainAccess?: boolean;

  sandboxRestricted?: boolean;
  isProdKycPlaybookRestricted?: boolean;
  isProdKybPlaybookRestricted?: boolean;
  isProdAuthPlaybookRestricted?: boolean;

  supportedAuthMethods?: TenantSupportedAuthMethod[] | null;
  allowedPreviewApis?: TenantPreviewApi[];

  billingProfile?: UpdateTenantBillingProfile;
  vendorControl?: UpdateTenantVendorControl;
};

const patchTenant = async (authHeaders: AuthHeaders, id: string, data: PrivatePatchTenantRequest) => {
  const response = await request<TenantDetail>({
    method: 'PATCH',
    url: `/private/tenants/${id}`,
    headers: authHeaders,
    data,
  });

  return response.data;
};

const useUpdateTenant = (id: string) => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PrivatePatchTenantRequest) => patchTenant(authHeaders, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

export default useUpdateTenant;

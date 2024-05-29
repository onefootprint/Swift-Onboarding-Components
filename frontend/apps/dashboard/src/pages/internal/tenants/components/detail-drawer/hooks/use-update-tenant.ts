import request from '@onefootprint/request';
import type {
  TenantDetail,
  TenantPreviewApi,
  TenantSupportedAuthMethod,
} from '@onefootprint/types/src/api/get-tenants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

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
};

const patchTenant = async (
  authHeaders: AuthHeaders,
  id: string,
  data: PrivatePatchTenantRequest,
) => {
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
    mutationFn: (data: PrivatePatchTenantRequest) =>
      patchTenant(authHeaders, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export default useUpdateTenant;

import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

type CreateSandboxTenantRequest = {
  name: string;
  domains: string[];
  superTenantId?: string;
  companySize?: string;
};

type CreateSandboxTenantResponse = {
  token: string;
};

const submitCreateSandboxTenantRequest = async (authHeaders: AuthHeaders, data: CreateSandboxTenantRequest) => {
  const response = await request<CreateSandboxTenantResponse>({
    method: 'POST',
    url: `/private/sandbox_tenant`,
    headers: authHeaders,
    data,
  });
  return response.data;
};

const useCreateSandboxTenant = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: (data: CreateSandboxTenantRequest) => submitCreateSandboxTenantRequest(authHeaders, data),
    onError: showErrorToast,
  });
};

export default useCreateSandboxTenant;

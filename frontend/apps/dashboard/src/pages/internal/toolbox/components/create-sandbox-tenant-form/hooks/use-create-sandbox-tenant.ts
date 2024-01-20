import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

type CreateSandboxTenantRequest = {
  name: string;
  domains: string[];
};

const submitCleanUpRqequest = async (
  authHeaders: AuthHeaders,
  data: CreateSandboxTenantRequest,
) => {
  const response = await request<{}>({
    method: 'POST',
    url: `/private/sandbox_tenant`,
    headers: authHeaders,
    data,
  });
  return response.data;
};

const useCleanUp = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: (data: CreateSandboxTenantRequest) =>
      submitCleanUpRqequest(authHeaders, data),
    onError: showErrorToast,
  });
};

export default useCleanUp;

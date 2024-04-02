import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { Organization } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

export type PostAssumeRequest = {
  tenantId: string;
};

const postAssumeTenantReadOnly = async (
  authHeaders: AuthHeaders,
  tenantId: string,
) => {
  const { data } = await request<Organization>({
    method: 'POST',
    url: '/private/assume',
    headers: authHeaders,
    data: {
      tenantId,
    },
  });
  return data;
};

const useAssumeTenant = () => {
  const { authHeaders } = useSession();
  const showErrorToast = useRequestErrorToast();

  return useMutation(
    (data: PostAssumeRequest) =>
      postAssumeTenantReadOnly(authHeaders, data.tenantId),
    {
      onError: (error: unknown) => {
        showErrorToast(error);
      },
    },
  );
};

export default useAssumeTenant;

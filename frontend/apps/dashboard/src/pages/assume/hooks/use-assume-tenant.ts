import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

export type PostAssumeRequest = {
  tenantId: string;
};

const postAssumeTenantReadOnly = async (
  authHeaders: AuthHeaders,
  tenantId: string,
) => {
  await request({
    method: 'POST',
    url: '/private/assume',
    headers: authHeaders,
    data: {
      tenantId,
    },
  });
};

const useAssumeTenant = () => {
  const { authHeaders } = useSession();
  const showErrorToast = useRequestErrorToast();

  return useMutation(
    (data: PostAssumeRequest) =>
      postAssumeTenantReadOnly(authHeaders, data.tenantId),
    {
      onError: showErrorToast,
    },
  );
};

export default useAssumeTenant;

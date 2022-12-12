import request, { RequestError } from '@onefootprint/request';
import { DecryptUserRequest, DecryptUserResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const userVaultDecryptRequest = async (
  authHeaders: AuthHeaders,
  data: DecryptUserRequest,
) => {
  const { footprintUserId, fields, reason } = data;
  const response = await request<DecryptUserResponse>({
    method: 'POST',
    url: `/users/${footprintUserId}/vault/identity/decrypt`,
    data: {
      fields,
      reason,
    },
    headers: authHeaders,
  });
  return response.data;
};

const useUserVaultDecrypt = () => {
  const { authHeaders } = useSession();
  return useMutation<DecryptUserResponse, RequestError, DecryptUserRequest>(
    (data: DecryptUserRequest) => userVaultDecryptRequest(authHeaders, data),
  );
};

export default useUserVaultDecrypt;

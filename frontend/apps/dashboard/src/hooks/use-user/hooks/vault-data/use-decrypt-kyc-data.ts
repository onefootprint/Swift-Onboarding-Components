import request, { RequestError } from '@onefootprint/request';
import { DecryptUserRequest, DecryptUserResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decryptKycData = async (
  { userId, fields, reason }: DecryptUserRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await request<DecryptUserResponse>({
    method: 'POST',
    url: `/users/${userId}/vault/identity/decrypt`,
    data: {
      fields,
      reason,
    },
    headers: authHeaders,
  });
  return response.data;
};

const useDecryptKycData = () => {
  const { authHeaders } = useSession();
  return useMutation<DecryptUserResponse, RequestError, DecryptUserRequest>(
    (data: DecryptUserRequest) => decryptKycData(data, authHeaders),
  );
};

export default useDecryptKycData;

import request, { RequestError } from '@onefootprint/request';
import { DecryptUserRequest, DecryptUserResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const decryptKycData = async ({
  footprintUserId,
  fields,
  reason,
  authHeaders,
}: DecryptUserRequest) => {
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

const useDecryptKycData = () => {
  const { authHeaders } = useSession();
  return useMutation<DecryptUserResponse, RequestError, DecryptUserRequest>(
    (data: Omit<DecryptUserRequest, 'authHeaders'>) =>
      decryptKycData({ authHeaders, ...data }),
  );
};

export default useDecryptKycData;

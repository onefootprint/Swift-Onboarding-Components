import request, { RequestError } from '@onefootprint/request';
import {
  DecryptKycDataRequest,
  DecryptKycDataResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decryptKycData = async (
  { userId, fields, reason }: DecryptKycDataRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await request<DecryptKycDataResponse>({
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
  return useMutation<
    DecryptKycDataResponse,
    RequestError,
    DecryptKycDataRequest
  >((data: DecryptKycDataRequest) => decryptKycData(data, authHeaders));
};

export default useDecryptKycData;

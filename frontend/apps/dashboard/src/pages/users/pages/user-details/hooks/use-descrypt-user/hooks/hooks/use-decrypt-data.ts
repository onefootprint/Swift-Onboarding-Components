import { requestWithoutCaseConverter } from '@onefootprint/request';
import { DecryptDataRequest, DecryptDataResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decryptData = async (
  { userId, fields, reason }: DecryptDataRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await requestWithoutCaseConverter<DecryptDataResponse>({
    method: 'POST',
    url: `/users/${userId}/vault/decrypt`,
    data: {
      fields,
      reason,
    },
    headers: authHeaders,
  });
  return response.data;
};

const useDecryptData = () => {
  const { authHeaders } = useSession();
  return useMutation((data: DecryptDataRequest) =>
    decryptData(data, authHeaders),
  );
};

export default useDecryptData;

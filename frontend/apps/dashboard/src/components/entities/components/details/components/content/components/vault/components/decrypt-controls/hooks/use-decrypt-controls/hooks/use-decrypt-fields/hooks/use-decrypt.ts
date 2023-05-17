import { requestWithoutCaseConverter } from '@onefootprint/request';
import { DecryptRequest, DecryptResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decrypt = async (
  { entityId, fields, reason }: DecryptRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await requestWithoutCaseConverter<DecryptResponse>({
    method: 'POST',
    url: `/entities/${entityId}/vault/decrypt`,
    data: {
      fields,
      reason,
    },
    headers: authHeaders,
  });
  return response.data;
};

const useDecrypt = () => {
  const { authHeaders } = useSession();
  return useMutation((data: DecryptRequest) => decrypt(data, authHeaders));
};

export default useDecrypt;

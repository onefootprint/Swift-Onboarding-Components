import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { DecryptRequest, DecryptResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const decrypt = async ({ entityId, fields, reason }: DecryptRequest, authHeaders: AuthHeaders) => {
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
  return useMutation({
    mutationFn: (data: DecryptRequest) => decrypt(data, authHeaders),
  });
};

export default useDecrypt;

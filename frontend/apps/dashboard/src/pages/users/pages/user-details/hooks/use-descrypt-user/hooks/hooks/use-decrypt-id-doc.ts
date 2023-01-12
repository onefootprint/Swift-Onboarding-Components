import request from '@onefootprint/request';
import { DecryptIdDocRequest, DecryptIdDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decryptIdDoc = async (
  { userId, reason, documentType }: DecryptIdDocRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await request<DecryptIdDocResponse>({
    method: 'POST',
    url: `/users/${userId}/vault/identity/document/decrypt`,
    data: {
      reason,
      documentType,
    },
    headers: authHeaders,
  });

  return response.data;
};

const useDecryptIdDoc = () => {
  const { authHeaders } = useSession();
  return useMutation((data: DecryptIdDocRequest) =>
    decryptIdDoc(data, authHeaders),
  );
};

export default useDecryptIdDoc;

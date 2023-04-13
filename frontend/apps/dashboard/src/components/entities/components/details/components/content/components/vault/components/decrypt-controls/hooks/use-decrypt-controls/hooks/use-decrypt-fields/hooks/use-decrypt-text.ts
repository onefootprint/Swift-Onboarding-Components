import { requestWithoutCaseConverter } from '@onefootprint/request';
import { DecryptRequest, DecryptResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decryptTextFields = async (
  { userId, fields, reason }: DecryptRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await requestWithoutCaseConverter<DecryptResponse>({
    method: 'POST',
    url: `/entities/${userId}/vault/decrypt`,
    data: {
      fields,
      reason,
    },
    headers: authHeaders,
  });
  return response.data;
};

const useDecryptTextFields = () => {
  const { authHeaders } = useSession();
  return useMutation((data: DecryptRequest) =>
    decryptTextFields(data, authHeaders),
  );
};

export default useDecryptTextFields;

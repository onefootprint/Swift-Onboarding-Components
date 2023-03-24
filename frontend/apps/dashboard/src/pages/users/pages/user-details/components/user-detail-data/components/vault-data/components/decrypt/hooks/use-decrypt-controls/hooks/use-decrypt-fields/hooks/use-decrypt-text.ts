import { requestWithoutCaseConverter } from '@onefootprint/request';
import { DecryptTextRequest, DecryptTextResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decryptTextFields = async (
  { userId, fields, reason }: DecryptTextRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await requestWithoutCaseConverter<DecryptTextResponse>({
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
  return useMutation((data: DecryptTextRequest) =>
    decryptTextFields(data, authHeaders),
  );
};

export default useDecryptTextFields;

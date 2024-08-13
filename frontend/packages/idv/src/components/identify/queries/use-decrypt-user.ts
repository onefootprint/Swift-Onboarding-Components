import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { DecryptUserRequest, DecryptUserResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const decryptUser = async ({ fields, authToken }: DecryptUserRequest) => {
  const response = await requestWithoutCaseConverter<DecryptUserResponse>({
    method: 'POST',
    url: '/hosted/user/vault/decrypt',
    data: { fields },
    headers: { [AUTH_HEADER]: authToken },
  });

  return response.data;
};

const useDecryptUser = () => useMutation({ mutationFn: decryptUser });

export default useDecryptUser;

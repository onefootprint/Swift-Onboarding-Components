import { requestWithoutCaseConverter } from '@onefootprint/request';
import { DecryptUserRequest, DecryptUserResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../config/constants';

const decryptUser = async ({ fields, authToken }: DecryptUserRequest) => {
  const response = await requestWithoutCaseConverter<DecryptUserResponse>({
    method: 'POST',
    url: '/hosted/user/vault/decrypt',
    data: {
      fields,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useDecryptUser = () =>
  useMutation((data: DecryptUserRequest) => decryptUser(data));

export default useDecryptUser;

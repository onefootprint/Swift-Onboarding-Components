import request from '@onefootprint/request';
import { UserDecryptRequest, UserDecryptResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../config/constants';

const decryptUserRequest = async (payload: UserDecryptRequest) => {
  const response = await request<UserDecryptResponse>({
    method: 'POST',
    url: '/hosted/user/decrypt',
    data: {
      attributes: payload.attributes,
    },
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserDecrypt = () => useMutation(decryptUserRequest);

export default useUserDecrypt;

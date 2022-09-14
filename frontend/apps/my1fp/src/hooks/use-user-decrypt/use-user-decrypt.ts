import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { UserDecryptRequest, UserDecryptResponse } from 'types';

import { MY1FP_AUTH_HEADER } from '../../config/constants';

const decryptUserRequest = async (payload: UserDecryptRequest) => {
  const response = await request<UserDecryptResponse>({
    method: 'POST',
    url: '/hosted/user/decrypt',
    data: {
      attributes: payload.attributes,
    },
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserDecrypt = () =>
  useMutation<UserDecryptResponse, RequestError, UserDecryptRequest>(
    decryptUserRequest,
  );

export default useUserDecrypt;

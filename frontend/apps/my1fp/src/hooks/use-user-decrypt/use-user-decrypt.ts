import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';

import { MY1FP_AUTH_HEADER } from '../../config/constants';

export type UserDecryptRequest = {
  attributes: string[];
  authToken: string;
};

export type UserDecryptResponse = {
  city: string | null;
  country: string | null;
  dob: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  state: string | null;
  streetAddress: string | null;
  streetAddress2: string | null;
  zip: string | null;
};

const decryptUserRequest = async (payload: UserDecryptRequest) => {
  const { data: response } = await request<
    RequestResponse<UserDecryptResponse>
  >({
    method: 'POST',
    url: '/user/decrypt',
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

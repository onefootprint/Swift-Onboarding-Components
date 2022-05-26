import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type DecryptUserRequest = {
  footprintUserId: string;
  attributes: string[];
};

export type DecryptedUserAttributes = {
  firstName?: string;
  lastName?: string;
  email?: string;
  ssn?: string;
  phoneNumber?: string;
};

const decryptUserRequest = async (payload: DecryptUserRequest) => {
  const { data: response } = await request<
    RequestResponse<DecryptedUserAttributes>
  >({
    method: 'POST',
    url: 'http://localhost:8000/org/decrypt',
    data: payload,
    headers: {
      'x-client-secret-key': 'sk_hsSPWQe1TjZ9k9fWZbuOva0AZ7MHVfpscJ',
    },
  });

  return response.data;
};

const useDecryptUser = () =>
  useMutation<DecryptedUserAttributes, RequestError, DecryptUserRequest>(
    decryptUserRequest,
  );

export default useDecryptUser;

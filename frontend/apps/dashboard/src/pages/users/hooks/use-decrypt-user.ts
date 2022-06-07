import useSessionUser from '@src/hooks/use-session-user';
import { partial } from 'lodash';
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
  phoneNumber?: string;
  ssn?: string;
  dob?: string;
  streetAddress?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

const decryptUserRequest = async (
  auth: string | undefined,
  { footprintUserId, attributes }: DecryptUserRequest,
) => {
  const { data: response } = await request<
    RequestResponse<DecryptedUserAttributes>
  >({
    method: 'POST',
    url: '/org/decrypt',
    data: { footprintUserId, attributes },
    headers: {
      'x-fp-dashboard-authorization': auth as string,
    },
  });

  return response.data;
};

const useDecryptUser = () => {
  const { data } = useSessionUser();
  const auth = data?.auth;

  return useMutation<DecryptedUserAttributes, RequestError, DecryptUserRequest>(
    partial(decryptUserRequest, auth),
  );
};
export default useDecryptUser;

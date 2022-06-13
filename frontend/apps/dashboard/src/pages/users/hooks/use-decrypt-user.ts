import { partial } from 'lodash';
import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

export type DecryptUserRequest = {
  footprintUserId: string;
  attributes: string[];
  reason: string;
};

export enum DataKind {
  firstName = 'first_name',
  lastName = 'last_name',
  email = 'email',
  phoneNumber = 'phone_number',
  ssn = 'ssn',
  lastFourSsn = 'last_four_ssn',
  dob = 'dob',
  streetAddress = 'street_address',
  streetAddress2 = 'street_address2',
  city = 'city',
  state = 'state',
  zip = 'zip',
  country = 'country',
}

export type DecryptedUserAttributes = Record<keyof typeof DataKind, string>;

const decryptUserRequest = async (
  auth: string | undefined,
  data: DecryptUserRequest,
) => {
  const { data: response } = await request<
    RequestResponse<DecryptedUserAttributes>
  >({
    method: 'POST',
    url: '/org/decrypt',
    data,
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth as string },
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

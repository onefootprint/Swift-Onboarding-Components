import { partial } from 'lodash';
import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import { DecryptedUserAttributes } from 'src/types';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

export type DecryptUserRequest = {
  footprintUserId: string;
  attributes: string[];
  reason: string;
};

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

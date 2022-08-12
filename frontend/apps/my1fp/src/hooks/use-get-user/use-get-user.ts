import { useQuery } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';

import { MY1FP_AUTH_HEADER } from '../../config/constants';
import useSessionUser from '../use-session-user';
import { UserIdentification } from '../use-session-user/use-session-user';

export type GetUserRequest = {
  authToken: string;
};

export type GetUserResponse = {
  emails: UserIdentification[];
  phoneNumbers: UserIdentification[];
};

const getUser = async (payload: GetUserRequest) => {
  const { data: response } = await request<RequestResponse<GetUserResponse>>({
    method: 'GET',
    url: '/hosted/user',
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useGetUser = (
  options: {
    onSuccess?: (data: GetUserResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const { session } = useSessionUser();
  const authToken = session?.authToken || '';

  return useQuery<GetUserResponse, RequestError>(
    ['get-user', authToken],
    () => getUser({ authToken }),
    {
      enabled: !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetUser;

import { useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

import { MY1FP_AUTH_HEADER } from '../../config/constants';
import useSessionUser from '../use-session-user';

export enum UserIdentificationPriority {
  primary = 'primary',
  secondary = 'secondary',
}

export type UserIdentification = {
  id: string;
  priority: UserIdentificationPriority;
  isVerified: boolean;
};

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
    url: '/user',
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

// TODO: start using this hook instead of use-user-decrypt next
const useGetUser = () => {
  const { session } = useSessionUser();
  const authToken = session?.authToken || '';

  return useQuery<GetUserResponse, RequestError>(
    ['get-user', authToken],
    () => getUser({ authToken }),
    {
      enabled: !!authToken,
    },
  );
};

export default useGetUser;

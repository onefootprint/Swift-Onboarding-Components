import { useQuery } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';
import useSessionUser from 'src/hooks/use-session-user';

import { AuthorizedOrg } from '../types';

export type AuthorizedOrgsRequest = {
  authToken: string;
};

export type AuthorizedOrgsResponse = AuthorizedOrg[];

const getAuthorizedOrgs = async (payload: AuthorizedOrgsRequest) => {
  const { data: response } = await request<
    RequestResponse<AuthorizedOrgsResponse>
  >({
    method: 'GET',
    url: '/hosted/user/authorized_orgs',
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useGetAuthorizedOrgs = (
  options: {
    onSuccess?: (data: AuthorizedOrgsResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const { session } = useSessionUser();
  const authToken = session?.authToken || '';

  return useQuery<AuthorizedOrgsResponse, RequestError>(
    ['get-authorized-orgs', authToken],
    () => getAuthorizedOrgs({ authToken }),
    {
      enabled: !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetAuthorizedOrgs;
